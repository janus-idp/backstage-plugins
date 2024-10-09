import { createBackend } from '@backstage/backend-defaults';

import lightspeedPlugin from '../src';

const backend = createBackend();
backend.add(lightspeedPlugin);
backend.start();
