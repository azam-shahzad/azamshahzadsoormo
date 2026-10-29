#!/usr/bin/env bash
# Downloads the Truxco (Option 01 · Classic) assets exported from Figma.
# Figma MCP asset URLs are temporary (about 7 days from 2026-10-29).
# Run from anywhere: bash truxco/download-assets.sh
# Feature icons (assets/fx-*.svg) are local files and need no download.
set -euo pipefail
cd "$(dirname "$0")/assets"

A=https://www.figma.com/api/mcp/asset/abe072a6-262a-4d2f-a374-dc8aea5f6b5a
C=https://www.figma.com/api/mcp/asset/92df05d3-44a4-4b3d-8ce4-ec47ae47ebfa

while read -r name url; do
  curl -fsSL -o "$name" "$url" && echo "ok   $name" || echo "FAIL $name"
done <<EOF
hero.png               $A/92e15.png
icon-phone.svg         $A/a1707.svg
icon-arrow-right.svg   $A/73a7d.svg
icon-chevron.svg       $A/a43c5.svg
icon-arrow-white.svg   $C/6e3d6.svg
EOF
