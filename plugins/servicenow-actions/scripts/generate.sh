#!/bin/bash

cd "$(dirname "$0")"/.. || exit 1

# iterate through the openapi directory and all it's children to
# generate the client on each .json spec file
for file in $(find openapi -name '*.json'); do
  echo "Generating client for $file"

  if [[ $file =~ openapi\/(.*).json ]]
  then
    name=${BASH_REMATCH[1]}
    echo "Generating client for $name"
    yarn openapi --input "./$file" --output "./src/generated/$name" --useUnionTypes --useOptions
  fi
done
