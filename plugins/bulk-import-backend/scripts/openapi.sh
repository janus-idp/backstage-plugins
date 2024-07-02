#!/bin/bash
#
# Copyright 2024 The Janus IDP Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

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
