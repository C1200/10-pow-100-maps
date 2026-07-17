import { createContext, useContext } from "react";

export interface User {
  id: string;
  username: string;
  avatar?: string;
  global_name?: string;
}

export interface API {
  loading: boolean;
  login(): void;
  user: User | null;
}

export const AuthContext = createContext<API>({
  loading: true,
  login: () => {},
  user: null,
});

export function useAuth() {
  return useContext(AuthContext);
}
