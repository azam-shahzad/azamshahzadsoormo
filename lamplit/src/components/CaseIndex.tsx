import { CASES } from "../data/cases";
import { caseSpread } from "../lib/scene";
import styles from "./CaseIndex.module.css";

// The book's table of contents as plain links, for keyboard and screen-reader users.
// Hidden until a link takes focus; each link is a spread hash the scene already follows.
const backCover = Math.ceil(CASES.length / 2) + 2;

export default function CaseIndex() {
  return (
    <nav className={styles.index} aria-label="Cases">
      <ol>
        <li>
          <a href="#1">Contents</a>
        </li>
        {CASES.map((c, i) => (
          <li key={c.slug}>
            <a href={`#${caseSpread(i)}`}>
              {String(i + 1).padStart(2, "0")} {c.title}
            </a>
          </li>
        ))}
        <li>
          <a href={`#${backCover}`}>Back cover</a>
        </li>
        <li>
          <a href="#0">Close the book</a>
        </li>
      </ol>
    </nav>
  );
}
