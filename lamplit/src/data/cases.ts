// The book's pages, in order. Each case is a 16:10 screen recording in ASSETS: case-<slug>.mp4 (1280 × 800),
// case-<slug>-phone.mp4 (854 × 534, phones) and case-<slug>.jpg, the poster frame at `start` seconds: the frame the page
// rests on until it's hovered. `tag` is the small label on the contents page.
export type Case = { slug: string; title: string; tag: string; start: number };

export const ASSETS = "https://assets.uberdesigner.ai/lamplit/";

export const CASES: Case[] = [
  { slug: "easylog", title: "easylog", tag: "saas", start: 11.567 },
  { slug: "lucid", title: "lucid", tag: "saas", start: 5.733 },
  { slug: "lacrima-foresta", title: "lacrima foresta", tag: "beauty", start: 5.767 },
  { slug: "portale", title: "portale", tag: "fintech", start: 2.867 },
  { slug: "knowsugar", title: "knowsugar", tag: "health", start: 2.167 },
  { slug: "lucent", title: "lucent", tag: "health", start: 1.567 },
  { slug: "metal-piece", title: "metal piece", tag: "fashion", start: 4.6 },
  { slug: "hard-agate", title: "hard agate", tag: "beauty", start: 4.433 },
  { slug: "wild-gallery", title: "wild gallery", tag: "photography", start: 6.033 },
  { slug: "chest-pro", title: "chest pro", tag: "education", start: 4.933 },
  { slug: "duo-card", title: "duo card", tag: "travel", start: 12.5 },
  { slug: "kernel-code", title: "kernel code", tag: "education", start: 3.367 },
  { slug: "moorline", title: "moorline", tag: "ai", start: 8.833 },
  { slug: "planets", title: "planets", tag: "travel", start: 7.333 },
  { slug: "drift-school", title: "drift school", tag: "education", start: 4.933 },
  { slug: "dj-zak", title: "dj zak", tag: "art", start: 3.533 },
  { slug: "alpha-project", title: "alpha project", tag: "ai", start: 4.333 },
  { slug: "ostrel", title: "ostrel", tag: "e-commerce", start: 3.533 },
  { slug: "nyblo-one", title: "nyblo one", tag: "e-commerce", start: 4.0 },
  { slug: "orvane-cup", title: "orvane cup", tag: "education", start: 5.0 },
  { slug: "detent", title: "detent", tag: "e-commerce", start: 3.233 },
];

export const caseMedia = (c: Case, phone: boolean) => ({
  src: `${ASSETS}case-${c.slug}${phone ? "-phone" : ""}.mp4`,
  poster: `${ASSETS}case-${c.slug}.jpg`,
});
