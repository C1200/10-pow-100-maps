import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useMap } from "react-leaflet";
import { getPoi, search, useData, type Poi } from "../data";
import stopMouseEventPropagation from "../util/stopMouseEventPropagation";
import crs from "../util/crs";
import { useUI } from "../util/useUI";

import styles from "./UISearch.module.css";

export default function UISearch() {
  const ui = useUI();
  const map = useMap();
  const data = useData();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const results = useMemo(() => search(data, query), [data, query]);

  useOnClickOutside(containerRef, () => {
    setFocus(false);
  });

  const focusPoi = useCallback(
    (poi: Poi) => {
      inputRef.current?.blur();
      setFocus(false);
      map.flyTo(crs.xz(...poi.coords), 1);
      ui.setFocusedPoi(poi.id);
    },
    [map, ui, inputRef],
  );

  useEffect(() => {
    const poi = ui.focusedPoi && getPoi(data, ui.focusedPoi);
    if (poi) setQuery(poi.label);
  }, [data, ui.focusedPoi]);

  return (
    <div
      ref={containerRef}
      className={styles.search}
      {...stopMouseEventPropagation}
    >
      <form
        className={styles.form}
        onSubmit={(ev) => {
          ev.preventDefault();
          if (results[0]) {
            focusPoi(results[0]);
          }
        }}
      >
        <div className={`${styles.icon} material-icons`}>{"\ue8b6"}</div>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Search 10¹⁰⁰ Maps"
          value={query}
          onInput={(ev) => {
            setQuery(ev.currentTarget.value);
          }}
          onFocus={() => {
            setFocus(true);
          }}
        />
      </form>

      <ul
        className={styles.results}
        style={{ display: focus ? undefined : "none" }}
      >
        {results.map((result) => (
          <li
            key={result.id}
            onClick={() => {
              focusPoi(result);
            }}
          >
            <div className={`${styles.resultIcon} material-icons`}>
              {result.transportLines ? "\ue534" : "\ue0c8"}
            </div>
            <p className={styles.resultLabel}>
              {result.label}{" "}
              {result.address &&
                (result.address.street || result.address.town) && (
                  <span className={styles.resultAddress}>
                    {[
                      result.address.street,
                      result.address.town,
                      result.address.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
