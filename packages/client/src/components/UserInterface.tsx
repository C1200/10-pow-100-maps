import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { useEventListener } from "usehooks-ts";
import { getPoi, useData } from "../data";
import { UIContext, type ToastOptions } from "../util/useUI";
import crs from "../util/crs";

import styles from "./UserInterface.module.css";
import poiStyles from "./PoiMarkers.module.css";

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
    [map, data],
  );

  const updateToHash = useCallback(() => {
    let hash = `${crs.ll(map.getCenter()).join(":")}:${map.getZoom()}`;
    if (focusedPoi) hash += ":poi=" + focusedPoi;

    location.hash = hash;
  }, [map, focusedPoi]);

  useEffect(() => {
    updateFromHash(true);
  }, [updateFromHash]);

  useEffect(() => {
    updateToHash();
  }, [updateToHash]);

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
    mousedown(ev) {
      let marker = false;
      if (ev.originalEvent.target instanceof HTMLElement) {
        let target: HTMLElement | null = ev.originalEvent.target;
        while (target !== null) {
          if (target.classList.contains(poiStyles.poi)) {
            marker = true;
            break;
          }

          target = target.parentElement;
        }
      }

      if (!marker) {
        setFocusedPoi(null);
      }
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
        <div className={styles.toast + (toast ? " " + styles.show : "")}>
          {toast?.text}
        </div>
      </div>
    </UIContext>
  );
}
