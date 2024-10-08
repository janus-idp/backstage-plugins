import { createBackend } from '@backstage/backend-defaults';

import matomoBackendPlugin from '../src';

const backend = createBackend();

backend.add(matomoBackendPlugin);

backend.start();
