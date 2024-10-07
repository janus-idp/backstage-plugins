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

import {paginateArray} from "./pagination";

describe('pagination', ()=> {

    let testInput: string[];

    beforeEach(() => {
        testInput = [];
        for (let i = 0; i < 10; i++) {
            testInput.push(`val${i}`);
        }
    });

    it.each([undefined, []])
    ('should returned an empty array if %s array is passed', (arr) => {
       const result = paginateArray(arr, 1, 100);

       expect(result).toEqual({
          result: [],
          totalCount: 0.
       });
    });

    it('should throw an error if requested page number is negative', () => {
        expect(() => paginateArray(testInput, -1, 3)).toThrow('page must be >0. Got page=-1');
    });

    it('should throw an error if requested page number is zero', () => {
        expect(() => paginateArray(testInput, 0, 3)).toThrow('page must be >0. Got page=0');
    });

    it('should throw an error if requested page size is negative', () => {
        expect(() => paginateArray(testInput, 1, -1)).toThrow('size must be >=0. Got size=-1');
    });

    it.each([1, 2])('should return empty array if requested page size is zero, regardless of page number (%d)', (page) => {
        expect(paginateArray(testInput, page, 0)).toEqual({
            result: [],
            totalCount: testInput.length,
        });
    });

    it('should return whole input if size is bigger than input length', () => {
        const totalCount = testInput.length;

        const result = paginateArray(testInput, 1, totalCount + 1);

        expect(result).toEqual({
            result: testInput,
            totalCount,
        });
    });

    it('should return as much pages as the number of elements for a requested page size of 1', () => {
        const totalCount = testInput.length;
        const size = 1;

        for (let page = 1; page <= totalCount; page++) {
            expect(paginateArray(testInput, page, size)).toEqual({
                result: [
                    `val${page-1}`
                ],
                totalCount: testInput.length,
            });
        }

        // Requesting any next page should return an empty array
        expect(paginateArray(testInput, totalCount+1, size)).toEqual({
            result: [],
            totalCount: testInput.length,
        });
    });

    it('should return the appropriate number of pages for a specified size', () => {
        const totalCount = testInput.length;
        const size = 4;

        expect(paginateArray(testInput, 1, size)).toEqual({
            result: ['val0', 'val1', 'val2', 'val3'],
            totalCount,
        });
        expect(paginateArray(testInput, 2, size)).toEqual({
            result: ['val4', 'val5', 'val6', 'val7'],
            totalCount,
        });
        // last page should contain the remaining items
        // even if there are less than the requested size
        expect(paginateArray(testInput, 3, size)).toEqual({
            result: ['val8', 'val9'],
            totalCount,
        });

        // Requesting any next page should return an empty array
        expect(paginateArray(testInput, 4, size)).toEqual({
            result: [],
            totalCount: testInput.length,
        });
    });
});