import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useMap } from "react-leaflet";
import { useUI } from "./UserInterface";
import { getPoi, search, useData, type Poi } from "../data";
import crs from "../util/crs";
import stopMouseEventPropagation from "../util/stopMouseEventPropagation";

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

  const focusPoi = useCallback((poi: Poi) => {
    inputRef.current?.blur();
    setFocus(false);
    map.flyTo(crs.xz(...poi.coords), 1);
    ui.setFocusedPoi(poi.id);
  }, [map, ui, inputRef.current]);

  useEffect(() => {
    const poi = ui.focusedPoi && getPoi(data, ui.focusedPoi);
    if (poi) setQuery(poi.label);
  }, [ui.focusedPoi]);

  return (
    <div className="leaflet-top leaflet-left search-container">
      <div ref={containerRef} className="search" {...stopMouseEventPropagation}>
        <form
          className="search-form"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (results[0]) {
              focusPoi(results[0]);
            }
          }}
        >
          <div className="search-icon material-icons">{"\ue8b6"}</div>
          <input
            ref={inputRef}
            className="search-input"
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
          className="search-results"
          style={{ display: focus ? undefined : "none" }}
        >
          {results.map((result) => (
            <li
              key={result.id}
              onClick={() => {
                focusPoi(result);
              }}
            >
              <span className="result-icon material-icons">
                {result.type === "transport-stop" ? "\ue534" : "\ue0c8"}
              </span>
              <span className="result-label">{result.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
