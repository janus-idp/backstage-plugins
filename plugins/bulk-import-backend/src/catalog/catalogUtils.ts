
/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Config} from "@backstage/config";
import gitUrlParse from "git-url-parse";

export function getCatalogFilename(config: Config): string {
    return config.getOptionalString('catalog.import.entityFilename') ?? 'catalog-info.yaml';
}

export function getBranchName(config: Config): string {
    return config.getOptionalString('catalog.import.pullRequestBranchName') ?? 'backstage-integration';
}

export function getCatalogUrl(
    config: Config,
    repoUrl: string,
    defaultBranch: string = 'main',
): string {
    return `${repoUrl}/blob/${defaultBranch}/${getCatalogFilename(config)}`;
}

export function filterLocations(
    res: { id: string | undefined; target: string }[],
    search: string | undefined,
) {
    return search
        ? res.filter(loc => {
            const split = loc.target.split('/blob/');
            if (split.length < 2) {
                return false;
            }
            const repoUrl = split[0];
            const gitUrl = gitUrlParse(repoUrl);
            return gitUrl.name.toLowerCase().includes(search.toLowerCase());
        })
        : res;
}
