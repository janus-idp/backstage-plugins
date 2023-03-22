import {
  WorkFlowTaskParameter,
  type WorkflowDefinition,
} from '../../models/workflowDefinitionSchema';

export const mockAndromedaWorkflowDefinition: WorkflowDefinition = {
  id: 'andromeda',
  name: 'Onboard to Andromeda',
  type: 'INFRASTRUCTURE',
  author: 'John Doe',
  createDate: '2020-01-01T00:00:00.000Z',
  modifyDate: '2020-01-01T00:00:00.000Z',
  processingType: 'SEQUENTIAL',
  works: [
    {
      id: 'c7ba1d55-82e0-4037-9549-26a73fe40599',
      name: 'adGroupWorkFlowTask',
      parameters: {
        ['api-server']: {
          description: 'The api server',
          required: false,
          type: 'string',
          format: 'url',
        },
      },
      workType: 'TASK',
      outputs: ['OTHER'],
    },
    {
      id: 'mock-task-1',
      name: 'mock-task-1',
      parameters: {
        param1: {
          description: 'Some text only.',
          required: false,
          type: 'string',
          format: 'text',
        },
      },
      workType: 'TASK',
      outputs: ['OTHER'],
    },
  ],
};

export const mockWorkflowParams: Record<string, WorkFlowTaskParameter> = {
  param1: {
    description: 'Some text only.',
    required: false,
    type: 'string',
    format: 'text',
  },
  param2: {
    description: 'An URL parameter',
    required: true,
    type: 'string',
    format: 'url',
  },
  param3: {
    description: 'Date parameter type.',
    required: false,
    type: 'string',
    format: 'date',
  },
  param4: {
    description: 'Email parameter',
    required: true,
    format: 'email',
    type: 'string',
  },
  param5: {
    description: 'Numeric parameter',
    required: false,
    type: 'number',
  },
  param6: {
    description: 'Password parameter',
    required: true,
    type: 'string',
    format: 'password',
  },
  // {
  //   // TODO: not sure about this
  //   key: 'param7',
  //   description: 'Select parameter',
  //   required: false,
  //   type: 'MOCK-SELECT',
  //   options: [
  //     { key: 'option1', value: 'Option 1' },
  //     { key: 'option2', value: 'Option 2' },
  //   ],
  // },
};
