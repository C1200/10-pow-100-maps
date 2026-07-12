import { MapContainer, TileLayer } from "react-leaflet";
import {
  PoiMarkers,
  UIContextMenu,
  UIPoiInfo,
  UISearch,
  UserInterface,
} from "./components";
import crs from "./util/crs";

const tilesUrl = import.meta.env.DEV
  ? "http://server.mrjulsen.de:8100"
  : "https://julsen-bluemap.c1200.workers.dev";

function Map() {
  return (
    <MapContainer
      crs={crs}
      center={crs.xz(2103, -937)}
      zoom={0}
      zoomControl={false}
      attributionControl={false}
    >
      <UserInterface>
        <TileLayer
          url={`${tilesUrl}/maps/world/tiles/1/x{x}/z{y}.png`}
          tileSize={500}
          minZoom={-3}
          maxZoom={2}
          minNativeZoom={0}
          maxNativeZoom={0}
        />

        <UIContextMenu />
        <UIPoiInfo />
        <UISearch />
        <PoiMarkers />
      </UserInterface>
    </MapContainer>
  );
}

export default Map;
