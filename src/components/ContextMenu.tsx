import { useRef, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { useCopyToClipboard, useOnClickOutside } from "usehooks-ts";

interface MenuContext {
  mouse: [number, number];
  coords: [number, number];
}

export default function ContextMenu() {
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
        className="context-menu"
        style={{ left: menu.mouse[0], top: menu.mouse[1] }}
      >
        <button
          onClick={() => {
            copy(`${menu.coords[0]}, ${menu.coords[1]}`);
            setMenu(null);
          }}
        >
          Copy {menu.coords[0]}, {menu.coords[1]}
        </button>
        <button
          onClick={() => {
            copy(`${location.origin}/#${menu.coords[0]}:${menu.coords[1]}:1`);
            setMenu(null);
          }}
        >
          Share this location
        </button>
      </div>
    )
  );
}
