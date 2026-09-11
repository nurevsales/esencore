#!/usr/bin/env bash
# =============================================================================
# Esencore — download the six site photographs into ./img/
#
# Sourced from Pexels under the Pexels License (free for commercial use,
# no attribution required). Run this once from the repository root:
#
#     bash fetch-images.sh
#
# It writes 24 files (6 photographs x 4 widths). If you skip this step the
# site still works — it falls back to loading the same photographs from the
# Pexels CDN — but self-hosting is faster and does not depend on them.
#
# Replacing a photograph with real Esencore photography: drop your own file in
# as img/<name>-2600.jpg (and the other three widths) and nothing else changes.
# =============================================================================
set -euo pipefail
mkdir -p img

declare -A PHOTOS=(
  [hero]=38688812
  [formulation]=7470819
  [lyophilization]=8442020
  [analytical]=10514991
  [quality]=8533141
  [facility]=9574352
)
WIDTHS=(900 1400 2000 2600)

for name in "${!PHOTOS[@]}"; do
  id="${PHOTOS[$name]}"
  for w in "${WIDTHS[@]}"; do
    out="img/${name}-${w}.jpg"
    url="https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}"
    printf '  %-28s ' "$out"
    if curl -fsSL --retry 3 --retry-delay 2 -o "$out" "$url"; then
      printf 'ok (%s)\n' "$(du -h "$out" | cut -f1)"
    else
      printf 'FAILED\n' >&2
      rm -f "$out"
    fi
  done
done

echo
echo "Done. Files in ./img/"
echo
echo "Optional — smaller files with modern formats (needs ImageMagick):"
echo "  for f in img/*.jpg; do magick \"\$f\" -quality 60 \"\${f%.jpg}.webp\"; done"
echo "Then point the srcset in index.html at the .webp files."
