#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
[ -n "$GITHUB_ACCESS_TOKEN" ] && git config --global url."https://${GITHUB_ACCESS_TOKEN}@github.com/".insteadOf "git@github.com:"
git submodule update --init --remote --merge www/src/content
git -C www/src/content checkout main
pnpm install
