#!/bin/bash
# Build, then publish docs/ to https://konkur.ource--ode.workers.dev (GitHub Pages gets it from the git push).
# --committed: publish docs/ exactly as in the last commit (ignores work in progress in the tree).
set -e
cd "$(dirname "$0")"
export WRANGLER_SEND_METRICS=false
if [ "$1" = "--committed" ]; then
  tmp=$(mktemp -d)
  git archive HEAD docs wrangler.jsonc | tar -x -C "$tmp"
  (cd "$tmp" && wrangler deploy)
  rm -rf "$tmp"
else
  python build.py
  wrangler deploy
fi
