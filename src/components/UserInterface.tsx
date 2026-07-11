import { useCallback, useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { useEventListener } from "usehooks-ts";
import SearchSection from "./SearchSection";
import ContextMenu from "./ContextMenu";
import crs from "../util/crs";

export default function UserInterface() {
  const map = useMap();

  const updateFromHash = useCallback(() => {
    const hash = location.hash.substring(1).split(":");
    const cx = parseFloat(hash.shift() ?? "");
    const cz = parseFloat(hash.shift() ?? "");
    const zm = parseFloat(hash.shift() ?? "");
    if ([cx, cz, zm].some(Number.isNaN)) return;
    map.setView(crs.xz(cx, cz), zm);
  }, [map]);

  const updateToHash = useCallback(() => {
    const c = map.getCenter();
    location.hash = `${c.lng - 0.5}:${c.lat - 0.5}:${map.getZoom()}`;
  }, [map]);

  useEffect(() => {
    updateFromHash();
  }, [updateFromHash]);

  useEventListener("hashchange", () => {
    updateFromHash();
  });

  useMapEvents({
    moveend: updateToHash,
    zoomend: updateToHash,
  });

  return (
    <>
      <ContextMenu />
      <SearchSection />
    </>
  );
}
