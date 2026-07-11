import { CRS, Transformation, Util, type LatLngExpression } from "leaflet";

const crs = Util.extend(CRS.Simple, {
  transformation: new Transformation(1, 0, 1, 0),
  xz(x: number, z: number): LatLngExpression {
    return [z + 0.5, x + 0.5];
  },
});

export default crs;
