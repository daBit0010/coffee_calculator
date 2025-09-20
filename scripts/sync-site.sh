#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
TARGET_DIR="${1:-$(cd "$ROOT_DIR/.." && pwd)}"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "error: target directory '$TARGET_DIR' does not exist" >&2
  exit 1
fi

rsync -av \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude 'scripts/' \
  --exclude 'README.md' \
  "$ROOT_DIR"/ "$TARGET_DIR"/
