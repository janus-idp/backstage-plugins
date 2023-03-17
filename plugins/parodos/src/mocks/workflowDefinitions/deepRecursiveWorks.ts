import { type WorkflowDefinition } from '../../models/workflowDefinitionSchema';

export const mockDeepRecursiveWorks: WorkflowDefinition = {
  id: '5ba64c7c-5f3a-47cc-9237-ed82985f9860',
  name: 'masterWorkFlow',
  type: 'INFRASTRUCTURE',
  processingType: 'SEQUENTIAL',
  author: null,
  createDate: '2023-03-17T15:53:08.496+00:00',
  modifyDate: '2023-03-17T15:53:08.497+00:00',
  parameters: [
    {
      key: 'workloadId',
      description: 'The workload id',
      optional: false,
      type: 'TEXT',
    },
    {
      key: 'projectUrl',
      description: 'The project url',
      optional: true,
      type: 'URL',
    },
  ],
  works: [
    {
      id: 'cf549b50-db51-44cb-8c27-cb0cf820e06e',
      name: 'subWorkFlowThree',
      workType: 'WORKFLOW',
      processingType: 'PARALLEL',
      works: [
        {
          id: '121eb0c7-6b38-4142-8dd4-5ef62d876d95',
          name: 'sslCertificationWorkFlowTask',
          parameters: [
            {
              key: 'domainName',
              description: 'The domain name',
              optional: false,
              type: 'URL',
            },
            {
              key: 'ipAddress',
              description: 'The api address',
              optional: false,
              type: 'TEXT',
            },
          ],
          workType: 'TASK',
          outputs: ['HTTP2XX'],
        },
        {
          id: 'ac71fad0-1a71-452c-92ea-1c05dca66263',
          name: 'subWorkFlowTwo',
          workType: 'WORKFLOW',
          processingType: 'SEQUENTIAL',
          works: [
            {
              id: '5c0f8071-860a-4433-afa4-7c58bdaeb71f',
              name: 'subWorkFlowOne',
              parameters: [
                {
                  key: 'comment',
                  description: 'The workflow comment',
                  optional: false,
                  type: 'TEXT',
                },
              ],
              workType: 'WORKFLOW',
              processingType: 'PARALLEL',
              works: [
                {
                  id: 'dfa1da17-9bc2-4be2-9703-06bce8168bd3',
                  name: 'adGroupsWorkFlowTask',
                  parameters: [
                    {
                      key: 'adGroups',
                      description: 'The ad groups',
                      optional: false,
                      type: 'TEXT',
                    },
                    {
                      key: 'userId',
                      description: 'The user id',
                      optional: false,
                      type: 'TEXT',
                    },
                  ],
                  workType: 'TASK',
                  outputs: ['HTTP2XX', 'EXCEPTION'],
                },
                {
                  id: '088b87b3-5f81-4411-88c1-053be4aa3955',
                  name: 'splunkMonitoringWorkFlowTask',
                  parameters: [
                    {
                      key: 'clusterName',
                      description: 'The cluster name',
                      optional: false,
                      type: 'TEXT',
                    },
                    {
                      key: 'hostname',
                      description: 'The hostname',
                      optional: false,
                      type: 'TEXT',
                    },
                  ],
                  workType: 'TASK',
                  outputs: ['OTHER'],
                },
              ],
            },
            {
              id: 'b17a9260-3846-4b25-a661-11955de1a1ce',
              name: 'namespaceWorkFlowTask',
              parameters: [
                {
                  key: 'projectId',
                  description: 'The project id',
                  optional: false,
                  type: 'NUMBER',
                },
              ],
              workType: 'TASK',
              outputs: ['HTTP2XX'],
            },
          ],
        },
      ],
    },
    {
      id: '6b38a6e5-f4d2-4f98-ac40-6bbfec16a1dc',
      name: 'subWorkFlowFour',
      workType: 'WORKFLOW',
      processingType: 'PARALLEL',
      works: [
        {
          id: '2f721120-7412-40ab-a2ec-bb6d915ed7ea',
          name: 'loadBalancerWorkFlowTask',
          parameters: [
            {
              key: 'hostname',
              description: 'The hostname',
              optional: false,
              type: 'URL',
            },
            {
              key: 'appId',
              description: 'The app id',
              optional: false,
              type: 'TEXT',
            },
          ],
          workType: 'TASK',
          outputs: ['HTTP2XX'],
        },
        {
          id: '4743c53d-bbdc-4c5d-9141-f50033127d5d',
          name: 'singleSignOnWorkFlowTask',
          parameters: [
            {
              key: 'userId',
              description: 'The user id',
              optional: false,
              type: 'TEXT',
            },
            {
              key: 'password',
              description: 'The password',
              optional: false,
              type: 'PASSWORD',
            },
          ],
          workType: 'TASK',
          outputs: ['OTHER'],
        },
      ],
    },
  ],
};
