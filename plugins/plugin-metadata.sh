#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" || exit; pwd)
workingDir=$SCRIPT_DIR
if [[ $workingDir == *"/plugins" ]]; then workingDir=$(cd "${SCRIPT_DIR}/../" || exit; pwd); fi
supportLevelsJSON="${workingDir}/plugins/plugin-metadata.json"

packageMetadata() {
    which_plugins="$1"
    supportLevelsToProcess="$2"
    extraflags="$3"
    for support in $supportLevelsToProcess; do
        (( num_s++ )) || true
    done
    for support in $supportLevelsToProcess; do
        (( s++ )) || true
        echo;echo "[$s/$num_s] Processing ${support} plugins to add/update metadata ..."
        for plugin in $(jq -r '."'"${which_plugins}"'"."'"${support}"'"[]' "$supportLevelsJSON"); do 
            (( num_p++ )) || true
        done
        for plugin in $(jq -r '."'"${which_plugins}"'"."'"${support}"'"[]' "$supportLevelsJSON"); do
            (( p++ )) || true
            # @janus-idp/backstage-plugin-[analytics-provider-segment] => plugins/[analytics-provider-segment]
            # @janus-idp/backstage-scaffolder-backend-module-[quay] => plugins/[quay]-actions
            dir=$(echo "${plugin}" | sed -r \
                -e "s|@janus-idp/backstage-plugin-|plugins/|" \
                -e "s|@janus-idp/backstage-scaffolder-backend-module-(.+)|plugins/\1-actions|" \
                -e "s|@janus-idp/(.+)|plugins/\1|" \
            )
            if [[ ! -d "${workingDir}/${dir}" ]] || [[ ! -f "${workingDir}/${dir}/package.json" ]]; then 
                echo "  [WARNING] ${workingDir}/${dir}/package.json not found! Skipping..."; 
            else
                echo;echo "[$s/$num_s] [$p/$num_p] Processing ${plugin} in ${dir}"
                pushd "${workingDir}" >/dev/null || exit
                # shellcheck disable=SC2086
                ./packages/cli/bin/janus-cli package metadata --dir "${dir}" --keywords "${support},lifecycle:active" $extraflags
                popd >/dev/null || exit
            fi
        done
    done
    echo
}

packageMetadata "showcase-plugins" "support:production support:tech-preview"
packageMetadata "other-plugins" "support:production"
packageMetadata "other-plugins" "support:tech-preview" "--author 'The Backstage Community'"
