import { ProcessInstanceState } from '@janus-idp/backstage-plugin-orchestrator-common';

export const firstLetterCapital = (text: string) =>
  text && text[0].toUpperCase() + text.slice(1).toLowerCase();

export const humanizeProcessInstanceState = (state: string) => {
  if (state.toLowerCase() === ProcessInstanceState.Active.toLocaleLowerCase()) {
    return 'Running';
  }
  return firstLetterCapital(state);
};
