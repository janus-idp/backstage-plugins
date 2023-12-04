import {
  ProcessInstance,
  ProcessInstanceState,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeWorkflowOverviewList } from './fakeWorkflowOverviewList';

let id = 10;
const baseDate = new Date('2023-11-16T10:50:34.346Z');
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const fakeProcessInstance1: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[0].name,
  processId: fakeWorkflowOverviewList[0].workflowId,
  state: ProcessInstanceState.Error,
  start: baseDate,
  end: new Date(baseDate.getTime() + 13 * HOUR),
  lastUpdate: new Date(baseDate.getTime() + DAY),
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
};

export const fakeProcessInstance2: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[1].name,
  processId: fakeWorkflowOverviewList[1].workflowId,
  state: ProcessInstanceState.Completed,
  start: new Date(baseDate.getTime() + HOUR),
  end: new Date(baseDate.getTime() + DAY),
  lastUpdate: new Date(baseDate.getTime() + DAY),
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
};

export const fakeProcessInstance3: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[2].name,
  processId: fakeWorkflowOverviewList[2].workflowId,
  state: ProcessInstanceState.Active,
  start: new Date(baseDate.getTime() + 2 * HOUR),
  lastUpdate: new Date(baseDate.getTime() + DAY),
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
};

export const fakeProcessInstance4: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[3].name,
  processId: fakeWorkflowOverviewList[3].workflowId,
  state: ProcessInstanceState.Suspended,
  start: baseDate,
  lastUpdate: new Date(baseDate.getTime() + 2 * DAY),
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
};

export const fakeProcessInstances = [
  fakeProcessInstance1,
  fakeProcessInstance2,
  fakeProcessInstance3,
  fakeProcessInstance4,
];
