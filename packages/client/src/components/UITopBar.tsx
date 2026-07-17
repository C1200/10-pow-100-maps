import UIAuthedUser from "./UIAuthedUser";
import UISearch from "./UISearch";

import styles from "./UITopBar.module.css";

export default function UITopBar() {
  return (
    <div className={styles.bar}>
      <UISearch />
      <UIAuthedUser />
    </div>
  );
}
