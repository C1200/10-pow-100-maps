import { useEffect, useState } from "react";
import norm from "../util/normalizeString";

export type Coords = [number, number];

export interface Poi {
  id: string;
  type: string;
  subtype: string;
  label: string;
  altNames?: string[];
  coords: Coords;
  weight: number;
  rweight?: number;
  transportLines?: string[]
}

export interface TransportLine {
  line: string;
  color: string;
  type: "train" | "metro" | "tram" | "bus";
}

export interface MapData {
  poi: Poi[];
  transportLines: TransportLine[]
}

export async function getData(): Promise<MapData> {
  const data: MapData = { poi: [], transportLines: [] };
  let maxPoiRWeight = 0;

  for (const get of Object.values(import.meta.glob("./*.json"))) {
    const json: any = await get();

    if (Array.isArray(json.poi)) {
      for (const poi of json.poi as Poi[]) {
        if (typeof poi.rweight === "number") {
          maxPoiRWeight = Math.max(poi.rweight, maxPoiRWeight);
        }

        data.poi.push(poi);
      }
    }

    if (Array.isArray(json.transportLines)) {
      data.transportLines.push(...json.transportLines);
    }
  }

  for (const poi of data.poi) {
    if (typeof poi.rweight === "number") {
      poi.weight = Math.floor((poi.rweight / maxPoiRWeight) * 100);
    }
  }

  data.poi.sort((a, b) => b.weight - a.weight);

  return data;
}

export function useData() {
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    getData().then((d) => setData(d));
  }, []);

  return data;
}

export function search(data: MapData | null, query: string) {
  if (!data) return [];

  query = norm(query);
  return data.poi
    .filter(
      (poi) =>
        norm(poi.label).includes(query) ||
        poi.altNames?.some((n) => norm(n).includes(query)),
    )
    .slice(0, 5)
    .sort(
      (a, b) =>
        Number(norm(b.label).startsWith(query)) -
        Number(norm(a.label).startsWith(query)),
    );
}

export function getPoi(data: MapData | null, id: string) {
  return data?.poi.find((p) => p.id === id) || null;
}
