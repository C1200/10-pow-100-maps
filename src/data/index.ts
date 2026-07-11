import { useEffect, useState } from "react";
import norm from "../util/normalizeString";

export type Coords = [number, number];

export interface Poi {
  id: string;
  type: string;
  subtype: string;
  label: string;
  coords: Coords;
  weight: number;
}

export interface MapData {
  poi: Poi[];
}

export async function getData(): Promise<MapData> {
  const data: MapData = { poi: [] };

  for (const get of Object.values(import.meta.glob("./*.json"))) {
    const json: any = await get();
    json.poi && data.poi.push(...json.poi);
  }

  data.poi.sort((a, b) => b.weight - a.weight);

  return data;
}

export function useData() {
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    getData().then(d => setData(d));
  }, []);

  return data;
}

export function search(data: MapData | null, query: string) {
  if (!data) return [];

  query = norm(query);
  return data.poi
    .filter((poi) => norm(poi.label).includes(query))
    .slice(0, 5)
    .sort(
      (a, b) =>
        Number(norm(b.label).startsWith(query)) -
        Number(norm(a.label).startsWith(query)),
    );
}
