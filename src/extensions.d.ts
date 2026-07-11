export * from "usehooks-ts";

declare module "usehooks-ts" {
  export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null> | RefObject<T | null>[],
    handler: (event: MouseEvent | TouchEvent | FocusEvent) => void,
    eventType?: EventType,
    eventListenerOptions?: AddEventListenerOptions,
  ): void;
}
