import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type User } from "../util/useAuth";
import { apiBase } from "../util/constants";

export default function AuthProvider(props: { children?: ReactNode }) {
  const [loading/*, setLoading*/] = useState<boolean>(true);
  const [user/*, setUser*/] = useState<User | null>(null);

  useEffect(() => {
    //fetch(apiBase + "/api/v1/user", { credentials: "include" }).then(
    //  async (r) => {
    //    if (r.ok) {
    //      setUser(await r.json());
    //    } else {
    //      setUser(null);
    //    }
    //    setLoading(false);
    //  },
    //);
  }, []);

  return (
    <AuthContext
      value={{
        loading,
        login() {
          location.href = apiBase + "/auth/discord";
        },
        user,
      }}
    >
      {props.children}
    </AuthContext>
  );
}
