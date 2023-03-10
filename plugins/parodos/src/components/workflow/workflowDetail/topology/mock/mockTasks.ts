import { WorkFlowTask } from '../type/WorkFlowTask';

export const mockTasks: WorkFlowTask[] = [
  {
    id: `Project Information`,
    label: `Project Information`,
    status: 'completed',
    locked: false,
    runAfterTasks: [],
  },
  {
    id: `adGroupWorkFlowTask`,
    label: `adGroupWorkFlowTask`,
    status: 'completed',
    locked: false,
    runAfterTasks: [`Project Information`],
  },
  {
    id: `nameSpaceWorkFlowTask`,
    label: `nameSpaceWorkFlowTask`,
    status: 'pending',
    locked: true,
    runAfterTasks: [`adGroupWorkFlowTask`, `dynatraceWorkFlowTask`],
  },
  {
    id: `failOverWorkFlowTask`,
    status: 'pending',
    label: `failOverWorkFlowTask`,
    locked: true,
    runAfterTasks: [`nameSpaceWorkFlowTask`, `certWorkFlowTask`],
  },
  {
    id: `loadBalancerFlowTask`,
    status: 'pending',
    label: `loadBalancerFlowTask`,
    locked: true,
    runAfterTasks: [`nameSpaceWorkFlowTask`, `certWorkFlowTask`],
  },
  {
    id: `dynatraceWorkFlowTask`,
    label: `dynatraceWorkFlowTask`,
    status: 'in_progress',
    locked: false,
    runAfterTasks: [`Project Information`],
  },
  {
    id: `certWorkFlowTask`,
    label: `certWorkFlowTask`,
    status: 'in_progress',
    locked: false,
    runAfterTasks: [`Project Information`],
  },
];

export const mockTasks2: WorkFlowTask[] = [
  {
    id: `Project Information`,
    label: `Project Information`,
    status: 'completed',
    locked: false,
    runAfterTasks: [],
  },
  {
    id: `adGroupWorkFlowTask`,
    label: `adGroupWorkFlowTask`,
    status: 'completed',
    locked: false,
    runAfterTasks: [`Project Information`],
  },
  {
    id: `nameSpaceWorkFlowTask`,
    label: `nameSpaceWorkFlowTask`,
    status: 'pending',
    locked: true,
    runAfterTasks: [`adGroupWorkFlowTask`, `dynatraceWorkFlowTask`],
  },
  {
    id: `failOverWorkFlowTask`,
    status: 'pending',
    label: `failOverWorkFlowTask`,
    locked: true,
    runAfterTasks: [`nameSpaceWorkFlowTask`, `certWorkFlowTask`],
  },
  {
    id: `loadBalancerFlowTask`,
    status: 'pending',
    label: `loadBalancerFlowTask`,
    locked: true,
    runAfterTasks: [`nameSpaceWorkFlowTask`, `certWorkFlowTask`],
  },
  {
    id: `dynatraceWorkFlowTask`,
    label: `dynatraceWorkFlowTask`,
    status: 'in_progress',
    locked: false,
    runAfterTasks: [`Project Information`],
  },
  {
    id: `certWorkFlowTask`,
    label: `certWorkFlowTask`,
    status: 'in_progress',
    locked: false,
    runAfterTasks: [`Project Information`],
  },
];
