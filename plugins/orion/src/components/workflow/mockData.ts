import { WorkflowDefinitionType, WorkFlowTaskParameterType } from '../types';

export const mockAndromedaWorkflowDefinition: WorkflowDefinitionType = {
  id: 'andromeda',
  name: 'Onboard to Andromeda',
  type: 'ASSESSMENT',
  description: 'Description of the Andromenda workflow',
  author: 'John Doe',
  createDate: '2020-01-01T00:00:00.000Z',
  modifyDate: '2020-01-01T00:00:00.000Z',
  tasks: [
    {
      id: 'c7ba1d55-82e0-4037-9549-26a73fe40599',
      name: 'adGroupWorkFlowTask',
      parameters: [
        {
          key: 'api-server',
          description: 'The api server',
          optional: false,
          type: 'URL',
        },
      ],
      outputs: ['OTHER'],
      workFlowChecker: '6702fac4-eeaf-4b82-9bd2-20c473712184',
      nextWorkFlow: 'aca36ef8-d388-4c64-81dc-4de63511b8a6',
    },
    {
      id: 'mock-task-1',
      name: 'mock-task-1',
      parameters: [
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
        {
          // TODO: swagger is missing this type
          key: 'param7',
          description: 'Select parameter',
          optional: false,
          type: 'MOCK-SELECT',
          options: [
            { key: 'option1', value: 'Option 1' },
            { key: 'option2', value: 'Option 2' },
          ],
        },
      ],
      outputs: ['OTHER'],
    },
  ],
};

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
  {
    // TODO: swagger is missing this type
    key: 'param7',
    description: 'Select parameter',
    optional: false,
    type: 'MOCK-SELECT',
    options: [
      { key: 'option1', value: 'Option 1' },
      { key: 'option2', value: 'Option 2' },
    ],
  },
];
