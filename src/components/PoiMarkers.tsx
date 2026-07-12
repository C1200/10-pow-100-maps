import { useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import DivMarker from "./DivMarker";
import { useUI } from "./UserInterface";
import { useData } from "../data";
import crs from "../util/crs";

export default function PoiMarkers() {
  const ui = useUI();
  const map = useMap();
  const data = useData();
  const [zoom, setZoom] = useState(0);

  useMapEvent("zoom", () => {
    setZoom(map.getZoom());
  });

  if (!data) return null;

  return data.poi.map((poi) => {
    let classNames = [];

    classNames.push("poi");
    classNames.push("poi-type-" + poi.type);
    classNames.push("poi-subtype-" + poi.subtype);

    //if (poi.type !== "settlement" && zoom < 0) {
    //  classNames.push("poi-hidden");
    //}

    if (poi.type !== "transport-stop" || zoom >= 0) {
      classNames.push("poi-show-label");
    }

    return (
      <DivMarker
        key={poi.id}
        className={classNames.join(" ")}
        size={poi.type === "pinlet" ? [22, 25] : [16, 16]}
        anchor={poi.type === "pinlet" ? [11, 25] : [8, 8]}
        position={crs.xz(...poi.coords)}
        onClick={() => {
          ui.setFocusedPoi(poi.id);
        }}
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
