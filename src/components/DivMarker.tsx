import * as L from "leaflet";
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Marker } from "react-leaflet";

export interface DivMarkerProps {
  className?: string;
  position: L.LatLngExpression;
  size?: L.PointExpression;
  anchor?: L.PointExpression;
  children?: ReactNode;
  onClick?: L.LeafletMouseEventHandlerFn;
}

export default function DivMarker(props: DivMarkerProps) {
  const [container] = useState(document.createElement("div"));

  return (
    <Marker
      position={props.position}
      icon={L.divIcon({
        className: props.className,
        iconSize: props.size,
        iconAnchor: props.anchor,
        html: container,
      })}
      eventHandlers={{
        click: props.onClick,
      }}
    >
      {createPortal(props.children, container)}
    </Marker>
  );
}
