#!/usr/bin/env bash
#
# Vercel "Ignored Build Step".
#
#   exit 1  -> build this commit
#   exit 0  -> skip it
#
# Why this exists
# ---------------
# Every push to any branch was triggering a full Vercel build, and this project
# statically generates ~1,539 pages, so a build is expensive in CPU-minutes. The
# audit workflow pushes once per model, which turned "commit progress" into
# "rebuild the entire site". On 2026-08-02 that was 19 preview builds against 1
# production build, and build CPU was the single largest line on the invoice
# ($106.47 of $222.41).
#
# Production still always builds. Previews are opt-in: put [preview] in the
# commit message when you actually want a preview URL to look at.

set -euo pipefail

# Only a confirmed preview is eligible to be skipped. Missing, custom or
# unexpected values fail safe and build instead of risking a canceled release.
case "${VERCEL_ENV:-}" in
  production)
    echo "VERCEL_ENV=production -> building"
    exit 1
    ;;
  preview)
    ;;
  *)
    echo "VERCEL_ENV=${VERCEL_ENV:-unset} is not preview -> building"
    exit 1
    ;;
esac

# Opt-in preview: any commit whose message contains [preview].
if ! MSG="$(git log -1 --pretty=%B 2>/dev/null)"; then
  echo "unable to read the HEAD commit message -> building"
  exit 1
fi

case "$MSG" in
  *'[preview]'*)
    echo "commit message opted in with [preview] -> building"
    exit 1
    ;;
esac

echo "non-production branch without [preview] -> skipping build"
echo "  (add [preview] to the commit message if you need a preview URL)"
exit 0
