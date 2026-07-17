import { useAuth } from "../util/useAuth";

import styles from "./UIAuthedUser.module.css";

export default function UIAuthedUser() {
  const auth = useAuth();

  if (auth.loading) {
    return null;
  }

  if (!auth.user) {
    return (
      <button
      className={styles.signIn}
        onClick={() => {
          auth.login();
        }}
      >
        Sign in
      </button>
    );
  }

  const id = parseInt(auth.user.id);
  const avatar = auth.user.avatar
    ? `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.png?size=44`
    : `https://cdn.discordapp.com/embed/avatars/${(id >> 22) % 6}.png?size=44`;

  return (
    <div className={styles.authedUser}>
      <img className={styles.avatar} src={avatar} />
    </div>
  );
}
