#!/usr/bin/env bash
# Downloads the Truxco (Option 01 · Classic) assets exported from Figma.
# Figma MCP asset URLs are temporary (about 7 days from 2026-10-29).
# Run from anywhere: bash truxco/download-assets.sh
set -euo pipefail
cd "$(dirname "$0")/assets"

A=https://www.figma.com/api/mcp/asset/abe072a6-262a-4d2f-a374-dc8aea5f6b5a
B=https://www.figma.com/api/mcp/asset/3e38b2e9-e083-4b4b-a47a-2c1bad0a36fb
C=https://www.figma.com/api/mcp/asset/92df05d3-44a4-4b3d-8ce4-ec47ae47ebfa
D=https://www.figma.com/api/mcp/asset/e6151af6-adfa-41a8-9b94-c093550c147e
E=https://www.figma.com/api/mcp/asset/6d5f176b-8feb-42bb-a0f6-354e3a46084e

while read -r name url; do
  curl -fsSL -o "$name" "$url" && echo "ok   $name" || echo "FAIL $name"
done <<EOF
hero.png               $A/92e15.png
icon-phone.svg         $A/a1707.svg
icon-arrow-right.svg   $A/73a7d.svg
icon-chevron.svg       $A/a43c5.svg
icon-check.svg         $B/75133.svg
icon-shield-badge.svg  $B/ca11f.svg
icon-arrow-white.svg   $C/6e3d6.svg
stat-bus.svg           $C/182f7.svg
stat-globe.svg         $C/4d403.svg
stat-users.svg         $C/30fe2.svg
stat-shield.svg        $C/4b52e.svg
service-inspected.svg  $D/b08d9.svg
service-broker.svg     $D/8af07.svg
service-technician.svg $D/377d9.svg
service-clock.svg      $D/2a782.svg
service-compare.svg    $D/7e356.svg
service-paperwork.svg  $D/34f34.svg
icon-clock-white.svg   $E/bb84f.svg
EOF
