import { useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import DivMarker from "./DivMarker";
import type { MapData } from "../data";
import crs from "../util/crs";

export interface PoiMarkersProps {
  data: MapData;
}

export default function PoiMarkers({ data }: PoiMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(0);

  useMapEvent("zoom", () => {
    setZoom(map.getZoom());
  });

  return data.poi.map((poi) => {
    let classNames = [];

    classNames.push("poi");
    classNames.push("poi-type-" + poi.type);
    classNames.push("poi-subtype-" + poi.subtype);

    if (poi.type !== "settlement" && zoom < 0) {
      classNames.push("poi-hidden");
    }

    return (
      <DivMarker
        key={poi.id}
        className={classNames.join(" ")}
        size={poi.type === "pinlet" ? [25, 25] : [16, 16]}
        anchor={poi.type === "pinlet" ? [12.5, 25] : [8, 8]}
        position={crs.xz(...poi.coords)}
      >
        {poi.type !== "settlement" && (
          <img
            className="poi-marker"
            src={`/poi-icon/${poi.type}/${poi.subtype}.png`}
          />
        )}

        <p className="poi-label">{poi.label}</p>
      </DivMarker>
    );
  });
}
