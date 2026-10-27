import { ASSETS } from "./cases";

// The studio behind the portfolio: a placeholder, Quillon. Swap the name, links and logo files for your own.
export const STUDIO = {
  name: "Quillon",
  contact: "mailto:hello@quillon.studio", // the "Get in Touch" button
  logo: `${ASSETS}logo.svg`, // white mark + wordmark (header, cover, contents, closing page, cards)
  mark: `${ASSETS}mark.svg`, // the round mark alone (back cover, white card)
  cover: "#000000", // book cover colour
};

export const HERO = {
  title: "Interactive Portfolio that you can explore",
  text: "Click on pages to view works, hover to see how they act in motion",
};

// Printed in the book (JetBrains Mono lines are set in capitals).
export const PRINT = {
  works: "Selected works · 2026",
  backCover: "Selected works — 2026",
  contents: "Contents",
  count: (n: number) => `${n} cases`,
  pick: "Select a case to jump to it",
  site: "quillon.studio",
  fin: "Fin.",
  thanks: "Thank you for looking",
  pencil: "QUILLON", // foil-stamped on the pencil
};
