#!/bin/bash
pwd
set -ex

npx openapi typegen src/openapi.yaml > src/openapi.d.ts

npx yaml2json -f ./src/openapi.yaml

export FILE=./src/openapidocument.ts
echo '// Generated file. Do not edit.' > ${FILE}
echo 'const OPENAPI = `' >> ${FILE}
cat ./src/openapi.json >> ${FILE}
echo '`' >> ${FILE}
echo "export const openApiDocument = JSON.parse(OPENAPI);" >> ${FILE}

rm ./src/openapi.json