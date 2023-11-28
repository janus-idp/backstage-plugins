import {
  ProcessInstance,
  ProcessInstanceState,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeProcessInstance: ProcessInstance = {
  id: '12f767c1-9002-43af-9515-62a72d0eafb2',
  processName: 'Workflow name',
  processId: 'workflow_actions',
  state: ProcessInstanceState.Error,
  start: new Date('2023-11-16T10:50:34.346Z'),
  lastUpdate: new Date('2023-11-16T10:50:34.5Z'),
  nodes: [],
  variables: {},
  end: new Date('2023-11-16T10:50:34.5Z'),
  endpoint: '',
};
