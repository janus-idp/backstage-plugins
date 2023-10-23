/*
 * Copyright 2020 The Backstage Authors
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

// Packages that we try to avoid duplicates for
const INCLUDED = [/^@backstage\//];

export const includedFilter = (name: string) =>
  INCLUDED.some(pattern => pattern.test(name));

// Packages that are not allowed to have any duplicates
const FORBID_DUPLICATES = [
  /^@backstage\/core-app-api$/,
  /^@backstage\/plugin-/,
];

// There are some packages that ARE explicitly allowed to have duplicates since
// they handle that appropriately. This takes precedence over FORBID_DUPLICATES
// above.
const ALLOW_DUPLICATES = [
  /^@backstage\/core-plugin-api$/,
  // Duplicates of libraries are OK
  // TODO(Rugvip): Check this using package role instead
  /^@backstage\/plugin-.*-react$/,
  /^@backstage\/plugin-.*-node$/,
  /^@backstage\/plugin-.*-common$/,
];

export const forbiddenDuplicatesFilter = (name: string) =>
  FORBID_DUPLICATES.some(pattern => pattern.test(name)) &&
  !ALLOW_DUPLICATES.some(pattern => pattern.test(name));
