import { WorkFlowTaskParameterType } from '../types';

export const mockApplications = [
  // TODO: fectch from API: https://issues.redhat.com/browse/FLPATH-102
  {
    id: 'app-andromeda',
    // TODO: mind using just "Andromeda" instead of "Onboard to Andromeda"
    name: 'Onboard to Andromeda',
    subtitle: 'New application',
    description: 'Lorem ipsum',
  },
  {
    id: 'app-solitaire',
    name: 'Sign up for Solitaire',
    subtitle: 'Mandatory for all new employees',
    description: 'Company-wide championship',
  },
];
[1, 2, 3, 4, 5, 6].forEach(i => {
  mockApplications.push({
    id: `app-${i}`,
    name: `Application ${i}`,
    subtitle: `Subtitle ${i}`,
    description: `Description ${i}`,
  });
});

export const mockWorkflowParams: WorkFlowTaskParameterType[] = [
  {
    key: 'param1',
    description: 'Some text only.',
    optional: false,
    type: 'TEXT',
  },
  {
    key: 'param2',
    description: 'An URL parameter',
    optional: true,
    type: 'URL',
  },
  {
    key: 'param3',
    description: 'Date parameter type.',
    optional: false,
    type: 'DATE',
  },
  {
    key: 'param4',
    description: 'Email parameter',
    optional: true,
    type: 'EMAIL',
  },
  {
    key: 'param5',
    description: 'Numeric parameter',
    optional: false,
    type: 'NUMBER',
  },
  {
    key: 'param6',
    description: 'Password parameter',
    optional: true,
    type: 'PASSWORD',
  },
];
