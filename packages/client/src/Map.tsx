import { MapContainer, TileLayer } from "react-leaflet";
import {
  AuthProvider,
  PoiMarkers,
  UIContextMenu,
  UIPoiInfo,
  UITopBar,
  UserInterface,
} from "./components";
import { apiBase } from "./util/constants";
import crs from "./util/crs";

function Map() {
  return (
    <AuthProvider>
      <MapContainer
        crs={crs}
        center={crs.xz(2103, -937)}
        zoom={0}
        zoomControl={false}
        attributionControl={false}
      >
        <UserInterface>
          <TileLayer
            url={`${apiBase}/images/tiles/1/{x}/{y}`}
            tileSize={500}
            minZoom={-3}
            maxZoom={2}
            minNativeZoom={0}
            maxNativeZoom={0}
          />

          <UIContextMenu />
          <UIPoiInfo />
          <UITopBar />
          <PoiMarkers />
        </UserInterface>
      </MapContainer>
    </AuthProvider>
  );
}

export default Map;
