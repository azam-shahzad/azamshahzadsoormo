import { useEffect, useRef, useState, type RefObject } from "react";
import { CASES, caseMedia } from "../data/cases";
import { PRINT, STUDIO } from "../data/studio";
import type { PrintCopy } from "../lib/pages";
import type { PropCopy } from "../lib/props";
import { quality } from "../lib/quality";
import { startScene } from "../lib/scene";
import styles from "./Stage.module.css";

const LABEL =
  "Quillon portfolio, an interactive 3D book on a table. Hover a page to play its video; click or drag pages to turn them, or use the arrow keys.";

type Props = {
  heroRef: RefObject<HTMLElement | null>;
  headerRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  onOpenChange: (open: boolean) => void;
  onError: (err: unknown) => void;
};

export default function Stage({ heroRef, headerRef, onReady, onOpenChange, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Callbacks live in a ref so the scene doesn't restart when they change.
  const callbacks = useRef({ onReady, onOpenChange, onError });
  useEffect(() => {
    callbacks.current = { onReady, onOpenChange, onError };
  });

  useEffect(() => {
    const host = hostRef.current, hero = heroRef.current, header = headerRef.current;
    if (!host || !hero || !header) return;
    const print: PrintCopy & PropCopy = PRINT;
    return startScene({
      host,
      className: styles.canvas,
      label: LABEL,
      hero,
      header,
      cases: CASES.map((c) => ({ ...c, ...caseMedia(c, quality.phoneVideo) })),
      brand: { logo: STUDIO.logo, mark: STUDIO.mark, bg: STUDIO.cover },
      print,
      onReady: () => {
        setReady(true);
        callbacks.current.onReady();
      },
      onOpenChange: (open) => callbacks.current.onOpenChange(open),
      onError: (err) => callbacks.current.onError(err),
    });
  }, [heroRef, headerRef]);

  return (
    <>
      <div ref={hostRef} className={styles.host} data-ready={ready || undefined} />
      <div className={styles.vignette} aria-hidden="true" />
    </>
  );
}
