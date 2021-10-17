/*
 * Copyright 2021 The Backstage Authors
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

import { createFactory } from '../types';

type Options = {
  id: string;
};

export const frontendPlugin = createFactory<Options>({
  name: 'plugin',
  description: 'A new frontend plugin',
  options: [
    {
      type: 'input',
      name: 'id',
      message: 'Enter an ID for the plugin',
      validate: (value: string) => {
        if (!value) {
          return 'Please enter an ID for the plugin';
        } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return 'Plugin IDs must be lowercase and contain only letters, digits, and dashes.';
        }
        return true;
      },
    },
  ],
  async create(options: Options) {
    console.log(
      `Creating ${this.name} with options ${JSON.stringify(options)}`,
    );
  },
});
