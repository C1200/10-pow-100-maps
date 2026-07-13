import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface ToastOptions {
  text: string;
  duration?: number;
}

export interface API {
  focusedPoi: string | null;
  setFocusedPoi: Dispatch<SetStateAction<string | null>>;
  showToast: (options: ToastOptions) => void;
}

export const UIContext = createContext<API>({
  focusedPoi: null,
  setFocusedPoi: () => {},
  showToast: () => {},
});

export function useUI() {
  return useContext(UIContext);
}
