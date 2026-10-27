import { useCallback, useRef, useState } from "react";
import styles from "./App.module.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Stage from "./components/Stage";

export default function App() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <>
      <Stage heroRef={heroRef} headerRef={headerRef} onReady={onReady} onOpenChange={setOpen} />
      <div className={styles.overlay}>
        <Header ref={headerRef} />
        <Hero ref={heroRef} state={!ready ? "hidden" : open ? "away" : "shown"} />
      </div>
    </>
  );
}
