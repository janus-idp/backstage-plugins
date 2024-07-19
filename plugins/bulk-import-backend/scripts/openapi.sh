#!/bin/bash
pwd
set -ex

TYPES_FILE=./src/openapi.d.ts
cat <<EOF > "${TYPES_FILE}"
// GENERATED FILE. DO NOT EDIT.

// eslint-disable
// prettier-ignore
EOF
npx --yes --package=openapicmd@2.3.2 -- openapi typegen ./src/schema/openapi.yaml >> "${TYPES_FILE}"

npx --yes --package=js-yaml-cli@0.6.0 -- yaml2json -f ./src/schema/openapi.yaml
OPENAPI_DOC_JS_FILE=./src/openapidocument.ts
cat <<EOF > "${OPENAPI_DOC_JS_FILE}"
// GENERATED FILE. DO NOT EDIT.

// eslint-disable
// prettier-ignore
EOF
echo 'const OPENAPI = `' >> "${OPENAPI_DOC_JS_FILE}"
cat ./src/schema/openapi.json | sed 's/\\n/\\\\n/g' >> "${OPENAPI_DOC_JS_FILE}"
echo '`' >> "${OPENAPI_DOC_JS_FILE}"
echo "export const openApiDocument = JSON.parse(OPENAPI);" >> "${OPENAPI_DOC_JS_FILE}"
rm -f ./src/schema/openapi.json

# Generate doc
#npx --yes --package=openapicmd@2.3.2 -- openapi redoc src/schema/openapi.yaml --bundle docs
npx --yes --package=@openapitools/openapi-generator-cli@2.13.4 -- \
  openapi-generator-cli generate -i ./src/schema/openapi.yaml -g markdown -o ./api-docs/
