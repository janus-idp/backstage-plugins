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

import { spawn } from 'child_process';
import { createLogPipe } from 'lib/logging';

export function startChild(args: string[]) {
  const [command, ...commandArgs] = args;
  const child = spawn(command, commandArgs, {
    env: { FORCE_COLOR: 'true', ...process.env },
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  // We need to avoid clearing the terminal, or the build feedback of dependencies will be lost
  const logPipe = createLogPipe();
  child.stdout.on('data', logPipe(process.stdout));
  child.stderr.on('data', logPipe(process.stderr));
  return child;
}
