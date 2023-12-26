import { ProcessInstanceState } from '@janus-idp/backstage-plugin-orchestrator-common';

import { capitalize } from './StringUtils';

export const humanizeProcessInstanceState = (state: string) => {
  if (state.toLowerCase() === ProcessInstanceState.Active.toLocaleLowerCase()) {
    return 'Running';
  }
  return capitalize(state);
};
