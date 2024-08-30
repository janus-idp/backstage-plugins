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

/**
 * Returns a paginated chunk of the specified array
 * @param array the array to paginate
 * @param page the page number
 * @param size the maximum number of elements in each page
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  size: number,
): { result: T[]; totalCount: number } {
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;

  return {
    result: array.slice(startIndex, endIndex),
    totalCount: array.length,
  };
}
