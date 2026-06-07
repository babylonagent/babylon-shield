#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
npm test
npm --workspace packages/sdk run lint
if grep -R -E "(inf_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9]{16,}|BEGIN PRIVATE)" --include='*.ts' --include='*.js' --include='*.json' --include='*.md' --include='.env*' . 2>/dev/null | grep -v node_modules; then
  echo "Potential secret found" >&2; exit 1
fi
echo "Babylon Shield verification passed"
