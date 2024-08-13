#!/bin/bash
pwd
set -ex

# Generate doc
npx --yes --package=@openapitools/openapi-generator-cli@2.13.4 -- \
  openapi-generator-cli generate -i ./src/schema/openapi.yaml -g markdown -o ./api-docs/