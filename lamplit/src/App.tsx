import { useCallback, useRef, useState } from "react";
import styles from "./App.module.css";
import CaseIndex from "./components/CaseIndex";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Stage from "./components/Stage";

export default function App() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  return (
    <>
      <Stage heroRef={heroRef} headerRef={headerRef} onReady={onReady} onOpenChange={setOpen} onError={onError} />
      <div className={styles.overlay}>
        <Header ref={headerRef} />
        <Hero ref={heroRef} state={failed ? "shown" : !ready ? "hidden" : open ? "away" : "shown"} />
        {ready && <CaseIndex />}
        {failed && (
          <p className={styles.error} role="alert">
            The portfolio book couldn’t load. Check your connection and reload the page.
          </p>
        )}
      </div>
    </>
  );
}
