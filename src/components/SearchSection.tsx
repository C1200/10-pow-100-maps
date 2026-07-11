import { useCallback, useMemo, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useMap } from "react-leaflet";
import { search, useData, type Poi } from "../data";
import crs from "../util/crs";

export default function SearchSection() {
  const map = useMap();
  const data = useData();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const results = useMemo(() => search(data, query), [data, query]);

  const focusPoi = useCallback(
    (poi: Poi) => {
      inputRef.current?.blur();
      map.flyTo(crs.xz(...poi.coords), 1);
      setQuery(poi.label);
      setFocus(false);
    },
    [map],
  );

  useOnClickOutside(containerRef, () => {
    setFocus(false);
  });

  return (
    <div className="leaflet-top leaflet-left">
      <div ref={containerRef} className="leaflet-control search">
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
