# Truxel website — saved versions

| Version | Commit | Date | What it contains |
|---|---|---|---|
| **v3** | `d06412f` | 2026-10-23 | Full modern redesign: frosted full-width nav, photo hero with glass stats bar, single-row ticker, bento About, interactive Services, expanding gallery, Impact photo panel, Nebula control hub, power-button CTA, energy contact, wordmark footer. Figma page: "v3 · Homepage (saved snapshot)". |

## How to go back to a saved version

Restore only the website folder to v3 (keeps all history, safe to undo):

```bash
git checkout d06412f -- truxel-energy
git commit -m "Restore Truxel website to v3"
git push
```

Just look at v3 without changing anything:

```bash
git show d06412f:truxel-energy/index.html > /tmp/truxel-v3.html
```

In Figma, open the page **"v3 · Homepage (saved snapshot)"**. Do not edit that page; work on a copy.
