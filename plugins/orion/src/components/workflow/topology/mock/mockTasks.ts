import {
  DEFAULT_FINALLY_NODE_TYPE,
  DEFAULT_TASK_NODE_TYPE,
} from '@patternfly/react-topology';
import { WorkFlowTask } from '../type/WorkFlowTask';

export const mockTasks: WorkFlowTask[] = [
  {
    id: `project-information`,
    type: DEFAULT_TASK_NODE_TYPE,
    label: `Project Information`,
    status: 'completed',
    locked: false,
    runAfterTasks: [],
  },
  {
    id: `SSL Certification`,
    type: DEFAULT_TASK_NODE_TYPE,
    label: `SSL Certification`,
    status: 'in_progress',
    locked: false,
    runAfterTasks: [`project-information`],
  },
  {
    id: `AD Groups`,
    type: DEFAULT_TASK_NODE_TYPE,
    label: `AD Groups`,
    status: 'completed',
    locked: false,
    runAfterTasks: [`project-information`],
  },
  {
    id: `Splunk Monitoring`,
    type: DEFAULT_TASK_NODE_TYPE,
    label: `Splunk Monitoring`,
    status: 'in_progress',
    locked: false,
    runAfterTasks: [`project-information`],
  },
  {
    id: `Namespace`,
    type: DEFAULT_TASK_NODE_TYPE,
    label: `Namespace`,
    status: 'pending',
    locked: true,
    runAfterTasks: [`AD Groups`, `Splunk Monitoring`],
  },
  {
    id: `Load Balancer`,
    type: DEFAULT_FINALLY_NODE_TYPE,
    status: 'pending',
    label: `Load Balancer`,
    locked: true,
    runAfterTasks: [],
  },
  {
    id: `Single Sign-on`,
    type: DEFAULT_FINALLY_NODE_TYPE,
    status: 'pending',
    label: `Single Sign-on`,
    locked: true,
    runAfterTasks: [],
  },
];
