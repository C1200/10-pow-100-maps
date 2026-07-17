import { useRef, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { useCopyToClipboard, useOnClickOutside } from "usehooks-ts";
import stopMouseEventPropagation from "../util/stopMouseEventPropagation";
import { useUI } from "../util/useUI";

import styles from "./UIContextMenu.module.css";

interface MenuContext {
  mouse: [number, number];
  coords: [number, number];
}

export default function UIContextMenu() {
  const ui = useUI();
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuContext | null>(null);
  const [_, copy] = useCopyToClipboard();

  useOnClickOutside(ref, () => {
    setMenu(null);
  });

  useMapEvents({
    contextmenu: (ev) => {
      ev.originalEvent.preventDefault();
      setMenu({
        mouse: [ev.originalEvent.x, ev.originalEvent.y],
        coords: [Math.floor(ev.latlng.lng), Math.floor(ev.latlng.lat)],
      });
    },
  });

  return (
    menu && (
      <div
        ref={ref}
        className={styles.menu}
        style={{ left: menu.mouse[0], top: menu.mouse[1] }}
        {...stopMouseEventPropagation}
      >
        <button
          className={styles.action}
          onClick={async () => {
            setMenu(null);
            const r = await copy(`${menu.coords[0]}, ${menu.coords[1]}`);
            ui.showToast({ text: r ? "Copied to clipboard" : "Copy failed" });
          }}
        >
          Copy {menu.coords[0]}, {menu.coords[1]}
        </button>
        <button
          className={styles.action}
          onClick={async () => {
            const url = `${location.origin}/#${menu.coords[0]}:${menu.coords[1]}:1`;
            setMenu(null);

            if (navigator.canShare && navigator.canShare()) {
              navigator.share({ url });
            } else {
              const r = await copy(url);
              ui.showToast({ text: r ? "Copied to clipboard" : "Copy failed" });
            }
          }}
        >
          Share this location
        </button>
      </div>
    )
  );
}
