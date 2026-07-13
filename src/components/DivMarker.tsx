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
  onAdd?: L.LeafletEventHandlerFn;
  onRemove?: L.LeafletEventHandlerFn;
  onClick?: L.LeafletMouseEventHandlerFn;
  data?: any;
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
        add: props.onAdd,
        remove: props.onRemove,
        click: props.onClick,
      }}
      // @ts-ignore
      data={props.data}
    >
      {createPortal(props.children, container)}
    </Marker>
  );
}
