import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { useEventListener } from "usehooks-ts";
import { getPoi, useData } from "../data";
import crs from "../util/crs";

interface ToastOptions {
  text: string;
  duration?: number;
}

interface API {
  focusedPoi: string | null;
  setFocusedPoi: Dispatch<SetStateAction<string | null>>;
  showToast: (options: ToastOptions) => void;
}

const UIContext = createContext<API>({
  focusedPoi: null,
  setFocusedPoi: () => {},
  showToast: () => {},
});

export function useUI() {
  return useContext(UIContext);
}

export default function UserInterface(props: { children?: ReactNode }) {
  const map = useMap();
  const data = useData();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [focusedPoi, setFocusedPoi] = useState<string | null>(null);

  const updateFromHash = useCallback(
    (initial = false) => {
      const hash = location.hash.substring(1).split(":");
      const cx = parseFloat(hash.shift() ?? "");
      const cz = parseFloat(hash.shift() ?? "");
      const zm = parseFloat(hash.shift() ?? "");
      if ([cx, cz, zm].some(Number.isNaN)) return;

      let focusedPoi: string | null = null;
      for (const part of hash) {
        if (part.startsWith("poi=")) {
          setFocusedPoi((focusedPoi = part.substring("poi=".length)));
          continue;
        }
      }

      if (focusedPoi) {
        const poi = getPoi(data, focusedPoi);

        if (poi && initial) {
          map.setView(crs.xz(...poi.coords), 1, { animate: false });
        }
      } else {
        map.setView(crs.xz(cx, cz), zm, { animate: false });
      }
    },
    [map, data, focusedPoi],
  );

  const updateToHash = useCallback(() => {
    let hash = `${crs.ll(map.getCenter()).join(":")}:${map.getZoom()}`;
    if (focusedPoi) hash += ":poi=" + focusedPoi;

    location.hash = hash;
  }, [map, focusedPoi]);

  useEffect(() => {
    updateFromHash(true);
  }, [data]);

  useEffect(() => {
    updateToHash();
  }, [focusedPoi]);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => {
      setToast(null);
    }, toast.duration || 2000);

    return () => {
      clearTimeout(t);
    };
  }, [toast]);

  useEventListener("hashchange", () => {
    updateFromHash();
  });

  useMapEvents({
    click() {
      setFocusedPoi(null);
    },
    moveend() {
      updateToHash();
    },
    zoomend() {
      updateToHash();
    },
  });

  return (
    <UIContext
      value={{
        focusedPoi,
        setFocusedPoi(v) {
          setFocusedPoi(v);
        },
        showToast(options) {
          setToast(options);
        },
      }}
    >
      {props.children}

      <div className="leaflet-bottom leaflet-right leaflet-left">
        <div className={"toast" + (toast ? " toast-show" : "")}>
          {toast?.text}
        </div>
      </div>
    </UIContext>
  );
}
