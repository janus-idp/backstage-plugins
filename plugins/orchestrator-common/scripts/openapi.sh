#!/bin/bash
pwd
set -e

OPENAPI_SPEC_FILE="./src/openapi/openapi.yaml"
SCHEMA_FILE="./src/auto-generated/api/models/schema.ts"
DEFINITION_FILE="./src/auto-generated/api/definition.ts"
METADATA_FILE="./src/auto-generated/.METADATA.sha1"

openapi_generate() {
    npx --yes openapi-typescript@6.7.5 ${OPENAPI_SPEC_FILE} -o ${SCHEMA_FILE}
    npx --yes @openapitools/openapi-generator-cli@v2.13.1 generate -g asciidoc -i ./src/openapi/openapi.yaml -o ./src/auto-generated/docs/index.adoc
    npx --yes --package=js-yaml-cli@0.6.0 -- yaml2json -f ${OPENAPI_SPEC_FILE}

    OPENAPI_SPEC_FILE_JSON=$(tr -d '[:space:]' < "$(dirname $OPENAPI_SPEC_FILE)"/openapi.json)
    cat << EOF > ${DEFINITION_FILE}
/* eslint-disable */
/* prettier-ignore */
// GENERATED FILE DO NOT EDIT.
const OPENAPI = \`${OPENAPI_SPEC_FILE_JSON}\`;
export const openApiDocument = JSON.parse(OPENAPI);
EOF

    rm ./src/openapi/openapi.json
    yarn openapi:prettier:fix
    NEW_SHA=$(openapi_checksum)
    openapi_update "${NEW_SHA}"
}

openapi_checksum() {
    export CONCATENATED_CONTENT=$(cat ${DEFINITION_FILE} ${SCHEMA_FILE} ${OPENAPI_SPEC_FILE})
    node -e $'console.log(crypto.createHash("sha1").update(`${process.env.CONCATENATED_CONTENT}`).digest("hex"))'
}

openapi_update() {
   echo "${1}" > "${METADATA_FILE}"
}

# Function to check if OpenAPI files are up-to-date
openapi_check() {

    if [ ! -f "${METADATA_FILE}" ]; then
        echo "Error: Metadata file '${METADATA_FILE}' not found. Run 'yarn openapi:generate' first."
        exit 1
    else
        STORED_SHA1=$(cat "${METADATA_FILE}")
    fi

    # Generate new SHA-1 checksum
    NEW_SHA1=$(openapi_checksum)

    # Check if the stored and current SHA-1 checksums differ
    if [ "${STORED_SHA1}" != "${NEW_SHA1}" ]; then
        echo "Changes detected in auto-generated files or openapi.yaml. Please run 'yarn openapi:generate' to update."
        exit 1
    else
        echo "No changes detected in auto-generated files or openapi.yaml. Auto-generated files are up to date."
    fi
}

# Check the command passed as an argument
case "$1" in
  "generate")
    openapi_generate
    ;;
  "check")
    openapi_check
    ;;
  *)
    echo "Error: Invalid command. Please use \"${0} generate\" to generate OpenAPI files or \"${0} check\" to verify their status."
    exit 1
    ;;
esac
