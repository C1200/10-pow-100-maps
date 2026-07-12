import { CRS, Transformation, Util, type LatLngExpression } from "leaflet";

const crs = Util.extend(CRS.Simple, {
  transformation: new Transformation(1, 0, 1, 0),
  xz(x: number, z: number): LatLngExpression {
    return [z + 0.5, x + 0.5];
  },
  ll(latlng: LatLngExpression): [number, number] {
    let lat: number;
    let lng: number;

    if (Array.isArray(latlng)) {
      lat = latlng[0];
      lng = latlng[1];
    } else {
      lat = latlng.lat;
      lng = latlng.lng;
    }

    return [lng - 0.5, lat - 0.5];
  },
});

export default crs;
