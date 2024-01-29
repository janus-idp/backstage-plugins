#!/bin/bash
pwd
set -ex

export SCHEMA=./src/auto-generated/api/models/schema.ts
npx openapi-typescript ./api/openapi.yaml -o ${SCHEMA} --alphabetize
# Fix sonarcloud warning typescript:S101 (Class names should comply with a naming convention)


npx yaml2json -f ./api/openapi.yaml

export FILE=./src/openapidocument.ts
echo '// GENERATED FILE. DO NOT EDIT.' > ${FILE}
echo 'const OPENAPI = `' >> ${FILE}
cat ./api/openapi.json >> ${FILE}
echo '`' >> ${FILE}
echo "export const openApiDocument = JSON.parse(OPENAPI);" >> ${FILE}

rm ./api/openapi.json