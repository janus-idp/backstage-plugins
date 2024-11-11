import { createBackend } from '@backstage/backend-defaults';

import { orchestratorPlugin } from '../src/plugin';

const backend = createBackend();

backend.add(orchestratorPlugin);

backend.start();
