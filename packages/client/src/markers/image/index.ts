import type { Marker } from "../types";

export const imageMarkers = ["bus", "publicrail"].map<Marker>((id) => ({
  id: `image:${id}`,
  async load() {
    return (await import(`./${id}.png`)).default;
  },
}));
