import type { Ref } from "react";
import { HERO } from "../data/studio";
import styles from "./Hero.module.css";

export type HeroState = "hidden" | "shown" | "away";

export default function Hero({ ref, state }: { ref: Ref<HTMLElement>; state: HeroState }) {
  return (
    <section ref={ref} className={`${styles.hero} ${styles[state]}`}>
      <h1 className={styles.title}>{HERO.title}</h1>
      <p className={styles.text}>{HERO.text}</p>
    </section>
  );
}
