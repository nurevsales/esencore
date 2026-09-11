#!/usr/bin/env bash
# =============================================================================
# Esencore — download the stock site photographs into ./img/
#
# Run once from the repository root, on a machine with internet:
#
#     bash fetch-images.sh
#
# Sourced from Pexels under the Pexels License (free for commercial use,
# no attribution required). Writes 20 files (5 photographs x 4 widths).
#
# NOTE — formulation is deliberately NOT in this list. That section uses a
# bespoke Esencore plate committed to the repo at img/formulation-{900,1400,
# 2000}.jpg. Fetching it here would overwrite that image with stock.
#
# Replacing any photograph with real Esencore photography: drop your own file
# in as img/<name>-2600.jpg (and the other widths) and nothing else changes.
# =============================================================================
set -euo pipefail
mkdir -p img

declare -A PHOTOS=(
  [hero]=38688812
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
    printf '  %-30s ' "$out"
    if curl -fsSL --retry 3 --retry-delay 2 -o "$out" "$url"; then
      printf 'ok (%s)\n' "$(du -h "$out" | cut -f1)"
    else
      printf 'FAILED\n' >&2
      rm -f "$out"
    fi
  done
done

echo
echo "Done. $(ls img/*.jpg 2>/dev/null | wc -l | tr -d ' ') files in ./img/"
echo "Commit them:  git add img && git commit -m 'Add site photographs' && git push"
