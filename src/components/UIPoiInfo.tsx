import { useEffect, useMemo, useState } from "react";
import { useUI } from "./UserInterface";
import { getPoi, useData, type Poi, type TransportLine } from "../data";
import stopMouseEventPropagation from "../util/stopMouseEventPropagation";

function getTypeString(options: { type: string; subtype: string }) {
  if (options.type === "transport-stop") {
    return "Transport Stop";
  }

  if (options.type === "pinlet") {
    switch (options.subtype) {
      case "airport":
        return "Airport";
      case "church-christian":
        return "Church";
      case "museum":
        return "Museum";
    }
  }
}

function TransportSection(props: {
  icon: string;
  title: string;
  lines: TransportLine[];
}) {
  if (props.lines.length === 0) return null;

  return (
    <section className="transport-section">
      <div className="section-icon material-icons">{props.icon}</div>
      <p className="section-title">{props.title}</p>
      <ul className="section-lines">
        {props.lines.map((l) => {
          const bg = parseInt(l.color.substring(1), 16);
          const luminance =
            (0.299 * (bg >> 16) +
              0.587 * ((bg >> 8) & 0xff) +
              0.114 * (bg & 0xff)) /
            255;

          return (
            <li
              key={l.line}
              style={{
                backgroundColor: l.color,
                color: luminance > 0.5 ? "#000" : "#fff",
              }}
            >
              {l.line}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function UIPoiInfo() {
  const ui = useUI();
  const data = useData();
  const [poi, setPoi] = useState<Poi | null>(null);
  const services = useMemo(() => {
    const o: { [x in TransportLine["type"]]: TransportLine[] } = {
      train: [],
      metro: [],
      tram: [],
      bus: [],
    };

    if (!data || !poi) return o;

    for (const l of data.transportLines) {
      if (!poi.transportLines?.includes(l.line)) continue;
      o[l.type].push(l);
    }

    return o;
  }, [data, poi]);

  useEffect(() => {
    const poi = ui.focusedPoi && getPoi(data, ui.focusedPoi);
    if (poi) setPoi(poi);
  }, [data, ui.focusedPoi]);

  if (!poi) return null;

  const type = getTypeString(poi);

  return (
    <div className="leaflet-top leaflet-bottom leaflet-left poi-info-container">
      <div className="sticky-shadow" />
      <div
        className={"poi-info" + (ui.focusedPoi ? " poi-info-show" : "")}
        {...stopMouseEventPropagation}
      >
        <div className="showcase-container"></div>

        <section className="info-section">
          <h1 className="poi-title">{poi.label}</h1>
          {type && <p className="poi-subtitle">{type}</p>}
        </section>

        {poi.type === "transport-stop" && (
          <section className="info-section">
            <TransportSection
              icon={"\ue570"}
              title="Trains"
              lines={services.train}
            />
            <TransportSection
              icon={"\ue56f"}
              title="Metro Services"
              lines={services.metro}
            />
            <TransportSection
              icon={"\ue571"}
              title="Trams"
              lines={services.tram}
            />
            <TransportSection
              icon={"\ue530"}
              title="Buses"
              lines={services.bus}
            />
          </section>
        )}
      </div>
    </div>
  );
}
