/*
 * Copyright 2020 Spotify AB
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

import { run } from 'helpers/run';
import { watchDeps } from 'commands/watch-deps';

export default async () => {
  const args = ['start'];

  // Start dynamic watch and build of dependencies, then serve the app
  await watchDeps();
  await run('react-scripts', args, {
    env: {
      EXTEND_ESLINT: 'true',
      SKIP_PREFLIGHT_CHECK: 'true',
    },
  });
};
