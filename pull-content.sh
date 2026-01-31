#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
git submodule update --remote --merge www/src/content
git -C www/src/content checkout main
git submodule status www/src/content
