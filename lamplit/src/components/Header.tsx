import type { Ref } from "react";
import { STUDIO } from "../data/studio";
import styles from "./Header.module.css";

export default function Header({ ref }: { ref: Ref<HTMLElement> }) {
  return (
    <header ref={ref} className={styles.header}>
      <a className={styles.logo} href="./" aria-label={STUDIO.name}>
        <img src={STUDIO.logo} alt="" width="130" height="31" crossOrigin="anonymous" />
      </a>
      <a className={styles.cta} href={STUDIO.contact}>
        Get in Touch
      </a>
    </header>
  );
}
