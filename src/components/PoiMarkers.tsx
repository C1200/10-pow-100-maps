import * as L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayerGroup, useMap, useMapEvent } from "react-leaflet";
import DivMarker from "./DivMarker";
import { useData } from "../data";
import { useUI } from "../util/useUI";
import crs from "../util/crs";

function createBounds(elem: HTMLElement) {
  const bb = elem.getBoundingClientRect();
  const bounds = L.bounds(
    L.point(bb.left, bb.top),
    L.point(bb.right, bb.bottom),
  );

  for (const child of elem.children) {
    if (
      child instanceof HTMLElement &&
      child.checkVisibility({ visibilityProperty: true, opacityProperty: true })
    ) {
      bounds.extend(createBounds(child));
    }
  }

  return bounds;
}

export default function PoiMarkers() {
  const ui = useUI();
  const map = useMap();
  const data = useData();
  const ref = useRef<L.LayerGroup>(null);
  const [zoom, setZoom] = useState(0);
  const [forceHide, setForceHide] = useState<Set<string>>(new Set());

  const updateCollisions = useCallback(() => {
    if (!ref.current) return;

    const forceHide = new Set<string>();

    for (const layer1 of ref.current.getLayers()) {
      if (!(layer1 instanceof L.Marker)) continue;
      // @ts-ignore
      let { id: id1, weight: weight1, subtype } = layer1.options.data;
      const elem1 = layer1.getElement();
      if (!elem1 || forceHide.has(id1)) continue;

      const bounds1 = createBounds(elem1);
      if (id1 === ui.focusedPoi) weight1 = 13000;
      else if (subtype === "city") weight1 = 12000;
      else if (subtype === "town") weight1 = 11000;
      else if (subtype === "village") weight1 = 10000;

      for (const layer2 of ref.current.getLayers()) {
        if (!(layer2 instanceof L.Marker)) continue;
        // @ts-ignore
        let { id: id2, weight: weight2, subtype } = layer2.options.data;
        const elem2 = layer2.getElement();
        if (!elem2 || layer1 === layer2 || forceHide.has(id2)) continue;

        const bounds2 = createBounds(elem2);
        if (id2 === ui.focusedPoi) weight2 = 13000;
        else if (subtype === "city") weight2 = 12000;
        else if (subtype === "town") weight2 = 11000;
        else if (subtype === "village") weight2 = 10000;

        if (bounds1.intersects(bounds2)) {
          if (weight1 > weight2) {
            forceHide.add(id2);
          } else {
            forceHide.add(id1);
          }
        }
      }
    }

    setForceHide(forceHide);
  }, [ui.focusedPoi]);

  useEffect(() => {
    setZoom(map.getZoom());
  }, [map]);

  useEffect(() => {
    updateCollisions();
  }, [updateCollisions])

  useMapEvent("zoomend", () => {
    setZoom(map.getZoom());
    updateCollisions();
  });

  if (!data) return null;

  return (
    <LayerGroup ref={ref}>
      {data.poi.map((poi, i, a) => {
        let classNames = [];

        classNames.push("poi");
        classNames.push("poi-type-" + poi.type);
        classNames.push("poi-subtype-" + poi.subtype);

        const pc = Math.min(5, zoom + 4) / 5;
        if (
          poi.id !== ui.focusedPoi &&
          (forceHide.has(poi.id) ||
            (poi.type !== "settlement" && i >= a.length * pc))
        ) {
          classNames.push("poi-hidden");
        }

        return (
          <DivMarker
            key={poi.id}
            className={classNames.join(" ")}
            size={poi.type === "pinlet" ? [22, 25] : [16, 16]}
            anchor={poi.type === "pinlet" ? [11, 25] : [8, 8]}
            position={crs.xz(...poi.coords)}
            onAdd={() => {
              updateCollisions();
            }}
            onRemove={() => {
              updateCollisions();
            }}
            onClick={() => {
              ui.setFocusedPoi(poi.id);
            }}
            data={poi}
          >
            {poi.type !== "settlement" && (
              <img
                className="poi-marker"
                src={`/poi-icon/${poi.type}/${poi.subtype}.png`}
              />
            )}

            <p
              className={
                "poi-label" +
                (poi.id !== ui.focusedPoi &&
                poi.type === "transport-stop" &&
                zoom < 0
                  ? " poi-hide-label"
                  : "")
              }
            >
              {poi.label}
            </p>
          </DivMarker>
        );
      })}
    </LayerGroup>
  );
}
