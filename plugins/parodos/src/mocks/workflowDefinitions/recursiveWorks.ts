import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';

export const mockRecursiveWorksWorkflowDefinition: WorkflowDefinition = {
  id: 'ea22c6ed-b7d4-48bf-98d2-f7c1c78643d8',
  name: 'subWorkFlowTwo',
  type: 'INFRASTRUCTURE',
  processingType: 'SEQUENTIAL',
  author: null,
  createDate: '2023-03-14T16:40:17.001+00:00',
  modifyDate: '2023-03-14T16:40:17.001+00:00',
  works: [
    {
      id: '981b027c-3891-4a1b-9c5d-de2d641884ba',
      name: 'subWorkFlowOne',
      workType: 'WORKFLOW',
      processingType: 'PARALLEL',
      works: [
        {
          id: '684d5cc0-3da7-4b18-9712-a60622748c5a',
          name: 'adGroupsWorkFlowTask',
          workType: 'TASK',
          parameters: {
            adGroups: {
              description: 'The ad groups',
              required: false,
              type: 'string',
              format: 'text',
            },
            userId: {
              description: 'The user id',
              required: false,
              type: 'string',
              format: 'text',
            },
          },
          outputs: ['HTTP2XX', 'EXCEPTION'],
        },
        {
          id: '09d93c82-8865-45fe-9348-bd6ef5b9aeb3',
          name: 'splunkMonitoringWorkFlowTask',
          workType: 'TASK',
          parameters: {
            clusterName: {
              description: 'The cluster name',
              required: false,
              type: 'string',
              format: 'text',
            },
            hostname: {
              description: 'The hostname',
              required: false,
              type: 'string',
              format: 'text',
            },
          },
          outputs: ['OTHER'],
        },
      ],
      parameters: {
        comment: {
          type: 'string',
          format: 'text',
          description: 'The workflow comment',
          required: false,
        },
      },
    },
    {
      id: 'e8d23ee9-8406-423c-beb7-c4e4f3ba0a21',
      name: 'namespaceWorkFlowTask',
      workType: 'TASK',
      parameters: {
        projectId: {
          description: 'The project id',
          required: false,
          type: 'number',
        },
      },
      outputs: ['HTTP2XX'],
    },
  ],
};
