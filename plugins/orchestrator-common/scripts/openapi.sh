#!/bin/bash
pwd
set -ex

# npx openapi typegen ./api/openapi.yaml > src/openapi/openapi.d.ts
npx openapi-typescript ./api/openapi.yaml -o ./src/auto-generated/api/models/schema.ts

npx yaml2json -f ./api/openapi.yaml

export FILE=./src/openapidocument.ts
echo '// GENERATED FILE. DO NOT EDIT.' > ${FILE}
echo 'const OPENAPI = `' >> ${FILE}
cat ./api/openapi.json >> ${FILE}
echo '`' >> ${FILE}
echo "export const openApiDocument = JSON.parse(OPENAPI);" >> ${FILE}

rm ./api/openapi.json