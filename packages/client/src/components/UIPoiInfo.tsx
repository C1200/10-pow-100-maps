import { useEffect, useMemo, useState } from "react";
import { getPoi, useData, type Poi, type TransportLine } from "../data";
import stopMouseEventPropagation from "../util/stopMouseEventPropagation";
import { useUI } from "../util/useUI";

import styles from "./UIPoiInfo.module.css";

function TransportSection(props: {
  icon: string;
  title: string;
  lines: TransportLine[];
}) {
  if (props.lines.length === 0) return null;

  return (
    <section className={styles.transportLines}>
      <div className={`${styles.linesDisplayIcon} material-icons`}>{props.icon}</div>
      <p className={styles.linesDisplayTitle}>{props.title}</p>
      <ul className={styles.linesDisplayList}>
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

    if (!data || !poi || !poi.transportLines) return o;

    for (const l of data.transportLines) {
      if (!poi.transportLines?.includes(l.line)) continue;
      o[l.type].push(l);
    }

    return o;
  }, [data, poi]);

  useEffect(() => {
    if (ui.focusedPoi) {
      document.body.classList.add(styles.show);
    } else {
      document.body.classList.remove(styles.show);
    }

    const poi = ui.focusedPoi && getPoi(data, ui.focusedPoi);
    if (poi) setPoi(poi);
  }, [data, ui.focusedPoi]);

  if (!poi) return null;

  return (
    <div className={styles.container}>
      <div className={styles.stickyShadow} />
      <div className={styles.content} {...stopMouseEventPropagation}>
        <div className={styles.showcaseContainer}></div>

        <section className={styles.section}>
          <h1 className={styles.title}>{poi.label}</h1>
          <p className={styles.subtitle}>{poi.short}</p>
        </section>

        {poi.transportLines && (
          <section className={styles.section}>
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
