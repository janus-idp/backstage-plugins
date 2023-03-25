import { type WorkflowDefinition } from '../../models/workflowDefinitionSchema';

export const mockDeepRecursiveWorks: WorkflowDefinition = {
  id: '527da27e-f461-4fac-8618-8d667c89166a',
  name: 'subWorkFlowThree',
  type: 'INFRASTRUCTURE',
  processingType: 'PARALLEL',
  author: null,
  createDate: '2023-03-22T16:16:01.434+00:00',
  modifyDate: '2023-03-22T16:16:01.435+00:00',
  works: [
    {
      id: '30897703-0d9a-45a4-97b4-66cf95c122de',
      name: 'sslCertificationWorkFlowTask',
      workType: 'TASK',
      parameters: {
        domainName: {
          format: 'url',
          description: 'The domain name',
          type: 'string',
          required: true,
        },
        ipAddress: {
          format: 'text',
          description: 'The api address',
          type: 'string',
          required: true,
        },
      },
      outputs: ['HTTP2XX'],
    },
    {
      id: '772cfa8b-da7d-49af-8f8c-0abc95fd086b',
      name: 'subWorkFlowTwo',
      workType: 'WORKFLOW',
      processingType: 'SEQUENTIAL',
      works: [
        {
          id: '8c5659e6-6776-427e-bf1e-daede1f764dc',
          name: 'subWorkFlowOne',
          workType: 'WORKFLOW',
          processingType: 'PARALLEL',
          works: [
            {
              id: '5d596e07-e245-46e6-98fa-1a98143c68e0',
              name: 'adGroupsWorkFlowTask',
              workType: 'TASK',
              parameters: {
                adGroups: {
                  format: 'text',
                  description: 'The ad groups',
                  type: 'string',
                  required: true,
                },
                userId: {
                  format: 'text',
                  description: 'The user id',
                  type: 'string',
                  required: true,
                },
              },
              outputs: ['HTTP2XX', 'EXCEPTION'],
            },
            {
              id: '397b452a-9833-455a-a22d-6bc985b8cd52',
              name: 'splunkMonitoringWorkFlowTask',
              workType: 'TASK',
              parameters: {
                hostname: {
                  format: 'text',
                  description: 'The hostname',
                  type: 'string',
                  required: true,
                },
                clusterName: {
                  format: 'text',
                  description: 'The cluster name',
                  type: 'string',
                  required: true,
                },
              },
              outputs: ['OTHER'],
            },
          ],
        },
        {
          id: '5d596e07-e245-46e6-98fa-1a98143c68e0',
          name: 'adGroupsWorkFlowTask',
          workType: 'TASK',
          parameters: {
            adGroups: {
              format: 'text',
              description: 'The ad groups',
              type: 'string',
              required: true,
            },
            userId: {
              format: 'text',
              description: 'The user id',
              type: 'string',
              required: true,
            },
          },
          outputs: ['HTTP2XX', 'EXCEPTION'],
        },
        {
          id: '397b452a-9833-455a-a22d-6bc985b8cd52',
          name: 'splunkMonitoringWorkFlowTask',
          workType: 'TASK',
          parameters: {
            hostname: {
              format: 'text',
              description: 'The hostname',
              type: 'string',
              required: true,
            },
            clusterName: {
              format: 'text',
              description: 'The cluster name',
              type: 'string',
              required: true,
            },
          },
          outputs: ['OTHER'],
        },
        {
          id: '3616aeda-1daf-4cce-bccc-f0857bff8482',
          name: 'namespaceWorkFlowTask',
          workType: 'TASK',
          parameters: {
            projectId: {
              description: 'The project id',
              type: 'number',
              required: true,
            },
          },
          outputs: ['HTTP2XX'],
        },
      ],
    },
  ],
};
