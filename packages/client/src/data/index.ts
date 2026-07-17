import { useEffect, useState } from "react";
import norm from "../util/normalizeString";

export type Coords = [number, number];

export interface Address {
  number?: string;
  street?: string;
  town?: string;
  city?: string;
}

export interface Poi {
  id: string;
  marker?: string;
  short: string;
  label: string;
  altNames?: string[];
  coords: Coords;
  address?: Address;
  transportLines?: string[];

  // legacy weighting
  weight: number;
  rweight?: number;

  // new weighting
  highPriority?: number;
}

export interface TransportLine {
  line: string;
  color: string;
  type: "train" | "metro" | "tram" | "bus";
}

export interface MapData {
  poi: Poi[];
  transportLines: TransportLine[];
}

declare global {
  interface Window {
    googoldata: Promise<MapData> | undefined;
  }
}

export async function getData(): Promise<MapData> {
  const data: MapData = { poi: [], transportLines: [] };
  let maxPoiRWeight: number = 0;

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
      poi.weight = Math.floor((poi.rweight / maxPoiRWeight) * 50);
    }
  }

  data.poi.sort((a, b) => b.weight - a.weight);

  return data;
}

export function useData() {
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    if (!window.googoldata) {
      window.googoldata = getData();
    }
    window.googoldata.then((d) => setData(d));
  }, []);

  return data;
}

export function search(data: MapData | null, query: string) {
  if (!data) return [];
  if (!query.trim()) data.poi.slice(0, 5);

  query = norm(query);
  return data.poi
    .filter(
      (poi) =>
        norm(poi.label).includes(query) ||
        poi.altNames?.some((n) => norm(n).includes(query)) ||
        Object.values(poi.address || {}).some((n) => norm(n).includes(query)),
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
