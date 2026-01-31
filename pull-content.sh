#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
git submodule update --remote --merge www/src/content
git submodule status www/src/content
