#!/bin/bash
pwd
set -e

OPENAPI_SPEC_FILE="./src/openapi/openapi.yaml"
SCHEMA_FILE="./src/auto-generated/api/models/schema.ts"
DEFINITION_FILE="./src/auto-generated/api/definition.ts"
METADATA_FILE="./src/auto-generated/.METADATA.sha1"


openapi_generate() {
    npx openapi-typescript ${OPENAPI_SPEC_FILE} -o ${SCHEMA_FILE}
    npx openapi-generator-cli generate -g asciidoc -i ./src/openapi/openapi.yaml -o ./src/auto-generated/docs/index.adoc
    npx yaml2json -f ${OPENAPI_SPEC_FILE}

    echo '// GENERATED FILE. DO NOT EDIT.' > ${DEFINITION_FILE}
    echo 'const OPENAPI = `' >> ${DEFINITION_FILE}
    cat ./src/openapi/openapi.json >> ${DEFINITION_FILE}
    echo '`' >> ${DEFINITION_FILE}
    echo "export const openApiDocument = JSON.parse(OPENAPI);" >> ${DEFINITION_FILE}

    rm ./src/openapi/openapi.json
    yarn openapi:prettier:fix
    NEW_SHA=$(openapi_checksum)
    openapi_update ${NEW_SHA}
}

openapi_checksum(){
    cat ${DEFINITION_FILE} ${SCHEMA_FILE} ${OPENAPI_SPEC_FILE} | sha1sum | awk '{print $1}' | tr -d '[:space:]'
}

openapi_update() {
   echo "${1}" > "${METADATA_FILE}"
}

# Function to check if OpenAPI files are up-to-date
openapi_check() {

    if [ ! -f "${METADATA_FILE}" ]; then
        echo "Error: Metadata file '${METADATA_FILE}' not found. Run 'generate_openapi.sh' first."
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
