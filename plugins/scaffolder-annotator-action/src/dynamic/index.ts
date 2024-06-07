import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import {
  createAnnotatorAction,
  createScaffoldedFromAction,
  createTimestampAction,
} from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [
    createTimestampAction(),
    createScaffoldedFromAction(),
    createAnnotatorAction(),
  ],
};
