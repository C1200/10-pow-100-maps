import { imageMarkers } from "./image";
import { pinletMarkers } from "./pinlet";
import type { Marker } from "./types";

export const markers: Marker[] = [...imageMarkers, ...pinletMarkers];

export function getMarker(id: string) {
  if (!id) return null;
  return markers.find((v) => v.id === id) || null;
}
