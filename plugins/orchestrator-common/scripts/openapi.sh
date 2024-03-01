#!/bin/bash
pwd
set -ex

npx openapi-typescript ./src/openapi/openapi.yaml -o ./src/auto-generated/api/models/schema.ts
npx openapi-generator-cli generate -g asciidoc -i ./src/openapi/openapi.yaml -o ./src/auto-generated/docs/index.adoc
npx yaml2json -f ./src/openapi/openapi.yaml

export FILE=./src/auto-generated/api/definition.ts
echo '// GENERATED FILE. DO NOT EDIT.' > ${FILE}
echo 'const OPENAPI = `' >> ${FILE}
cat ./src/openapi/openapi.json >> ${FILE}
echo '`' >> ${FILE}
echo "export const openApiDocument = JSON.parse(OPENAPI);" >> ${FILE}

rm ./src/openapi/openapi.json
yarn openapi:prettier:fix