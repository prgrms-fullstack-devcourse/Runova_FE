#!/usr/bin/env bash
set -eu

BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$BASE_SHA" ]; then
  BASE_SHA="HEAD^"
fi

if git diff --name-only "$BASE_SHA"...HEAD | grep -qE '^apps/web/'; then
  echo "✅ changes in apps/web → proceed build"
  exit 1
else
  echo "🛑 no changes in apps/web → skip build"
  exit 0
fi
