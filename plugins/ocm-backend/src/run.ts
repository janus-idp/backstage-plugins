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

import { getRootLogger } from '@backstage/backend-common';

// eslint-disable-next-line @backstage/no-undeclared-imports
import { setupServer } from 'msw/node';

import { handlers } from '../__fixtures__/handlers';
import { startStandaloneServer } from '../dev';

const logger = getRootLogger();
const port = process.env.PLUGIN_PORT ? Number(process.env.PLUGIN_PORT) : 7007;
const server = setupServer(...handlers);

server.listen();

startStandaloneServer({ port, logger }).catch(err => {
  logger.error('Standalone server failed:', err);
  server.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('CTRL+C pressed; exiting.');
  server.close();
  process.exit(0);
});
