import type { BaseSyntheticEvent } from "react";

const stopMouseEventPropagation = {
  onPointerDownCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onClick: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onDoubleClickCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onContextMenuCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onMouseDownCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onMouseUpCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onMouseMoveCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onWheelCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
  onScrollCapture: (ev: BaseSyntheticEvent) => {
    ev.stopPropagation();
  },
};

export default stopMouseEventPropagation;
