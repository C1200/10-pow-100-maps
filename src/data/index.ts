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
  type: string;
  subtype: string;
  label: string;
  altNames?: string[];
  coords: Coords;
  address?: Address;
  weight: number;
  rweight?: number;
  transportLines?: string[];
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

export type Importance = 1 | 2 | 3 | 4 | 5;

export interface TypeInfo {
  label: string | null;
  importance: Importance;
}

declare global {
  interface Window {
    googoldata: Promise<MapData> | undefined;
  }
}

export async function getData(): Promise<MapData> {
  const data: MapData = { poi: [], transportLines: [] };
  const maxPoiRWeight: { [x in Importance]: number } = {
    2: 0,
    1: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const get of Object.values(import.meta.glob("./*.json"))) {
    const json: any = await get();

    if (Array.isArray(json.poi)) {
      for (const poi of json.poi as Poi[]) {
        if (typeof poi.rweight === "number") {
          const im = getPoiTypeInfo(poi).importance;
          maxPoiRWeight[im] = Math.max(poi.rweight, maxPoiRWeight[im]);
        }

        data.poi.push(poi);
      }
    }

    if (Array.isArray(json.transportLines)) {
      data.transportLines.push(...json.transportLines);
    }
  }

  for (const poi of data.poi) {
    const im = getPoiTypeInfo(poi).importance;

    if (typeof poi.rweight === "number") {
      poi.weight = Math.floor((poi.rweight / maxPoiRWeight[im]) * 50);
    }

    poi.weight += im * 10;
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

export function getPoiTypeInfo(options: {
  type: string;
  subtype: string;
}): TypeInfo {
  let label = null;
  let importance: Importance = 1;
  if (options.type === "transport-stop") {
    label = "Transport Stop";
    switch (options.subtype) {
      case "public-rail":
        importance = 5;
        break;
      default:
        importance = 3;
        break;
    }
  } else if (options.type === "pinlet") {
    switch (options.subtype) {
      case "airport":
        label = "Airport";
        importance = 4;
        break;
      case "church-christian":
        label = "Church";
        break;
      case "fuel":
        label = "Petrol Station";
        importance = 4;
        break;
      case "hotel":
        label = "Hotel";
        break;
      case "museum":
        label = "Museum";
        importance = 2;
        break;
    }
  }

  return {
    label,
    importance,
  };
}
