#!/bin/bash

. "$(pwd)"/scripts/utils.sh

# Internal script used by CI to detect if we need to publish packages to NPM.

set -e

version=$(get_version)
published_version=`npm view @vertexvis/web-workers --json versions | jq --arg version "$version" -r '.[] | select(. == $version)'`

if test -z "$published_version"
then
  echo 1
else
  echo 0
fi
