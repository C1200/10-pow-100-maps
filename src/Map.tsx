import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { PoiMarkers, UserInterface } from "./components";
import { getData, type MapData } from "./data";
import crs from "./util/crs";

const tilesUrl = import.meta.env.DEV
  ? "http://server.mrjulsen.de:8100"
  : "https://julsen-bluemap.c1200.workers.dev";

function Map() {
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    getData().then((data) => setData(data));
  }, []);

  if (!data) return null;

  return (
    <MapContainer
      crs={crs}
      center={crs.xz(2103, -937)}
      zoom={0}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url={`${tilesUrl}/maps/world/tiles/1/x{x}/z{y}.png`}
        tileSize={500}
        minZoom={-3}
        maxZoom={2}
        minNativeZoom={0}
        maxNativeZoom={0}
      />

      <UserInterface />
      <PoiMarkers data={data} />
    </MapContainer>
  );
}

export default Map;
