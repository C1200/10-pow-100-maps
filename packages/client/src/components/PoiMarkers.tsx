import * as L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayerGroup, useMap, useMapEvent } from "react-leaflet";
import PromisedImage from "./PromisedImage";
import DivMarker from "./DivMarker";
import { getMarker } from "../markers";
import { useData } from "../data";
import { useUI } from "../util/useUI";
import crs from "../util/crs";

import styles from "./PoiMarkers.module.css";

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
      let { id: id1, weight: weight1, highPriority } = layer1.options.data;
      const elem1 = layer1.getElement();
      if (!elem1 || forceHide.has(id1)) continue;

      const bounds1 = createBounds(elem1);
      if (id1 === ui.focusedPoi) weight1 = 10004;
      else if (highPriority) weight1 = 10000 + highPriority;

      for (const layer2 of ref.current.getLayers()) {
        if (!(layer2 instanceof L.Marker)) continue;
        // @ts-ignore
        let { id: id2, weight: weight2, highPriority } = layer2.options.data;
        const elem2 = layer2.getElement();
        if (!elem2 || layer1 === layer2 || forceHide.has(id2)) continue;

        const bounds2 = createBounds(elem2);
        if (id2 === ui.focusedPoi) weight2 = 10004;
        else if (highPriority) weight2 = 10000 + highPriority;

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
  }, [updateCollisions]);

  useMapEvent("zoomend", () => {
    setZoom(map.getZoom());
    updateCollisions();
  });

  if (!data) return null;

  return (
    <LayerGroup ref={ref}>
      {data.poi.map((poi, i, a) => {
        let classNames = [];

        classNames.push(styles.poi);
        if (!poi.marker) {
          classNames.push(styles.labelOnly);
        }
        if (poi.highPriority) {
          classNames.push(styles["highPriority" + poi.highPriority]);
        }

        const pc = Math.min(5, zoom + 4) / 5;
        if (
          poi.id !== ui.focusedPoi &&
          (forceHide.has(poi.id) || (!poi.highPriority && i >= a.length * pc))
        ) {
          classNames.push(styles.poiHidden);
        }

        return (
          <DivMarker
            key={poi.id}
            className={classNames.filter(Boolean).join(" ")}
            size={poi.marker?.startsWith("pinlet:") ? [22, 25] : [16, 16]}
            anchor={poi.marker?.startsWith("pinlet:") ? [11, 25] : [8, 8]}
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
            {poi.marker && (
              <PromisedImage
                className={styles.poiMarker}
                src={getMarker(poi.marker)?.load}
              />
            )}

            <p
              className={
                styles.poiLabel +
                (poi.id !== ui.focusedPoi && poi.transportLines && zoom < 0
                  ? " " + styles.poiLabelHide
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
