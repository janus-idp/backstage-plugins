#!/bin/bash

cd "$(dirname "$0")"/.. || exit 1

echo "Generating OpenAPI clients"

# iterate through the openapi directory and all it's children to
# generate the client on each .json spec file
for file in $(find openapi -name '*.json'); do
  echo "Generating client for $file OpenAPI spec"

  if [[ $file =~ openapi\/(.*).json ]]
  then
    name=${BASH_REMATCH[1]}
    yarn openapi --input "./$file" --output "./src/generated/$name" --useUnionTypes --useOptions -c node
  fi
done

echo "Patching generated code"

# FIXME: remove once https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1751 is fixed
# This is a workaround for https://github.com/ferdikoomen/openapi-typescript-codegen/pull/1627
# iterate through the generated directory
for file in $(find src/generated -name '*.ts'); do
  echo "Patching $file"

  # remove function optional chainging from the generated code
  POSIXLY_CORRECT=1 sed -i.bak 's/\(this\.\#[[:alnum:]]*\)?\.(\(.*\))/if(\1) \1(\2)/g' $file
  rm $file.bak
done
