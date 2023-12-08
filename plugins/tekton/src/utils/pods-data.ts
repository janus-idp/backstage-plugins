import { V1Pod } from '@kubernetes/client-node';

export const testPods: V1Pod[] = [
  {
    metadata: {
      name: 'test-pipeline-8e09zm-task1-pod',
      namespace: 'karthik',
      uid: 'bd868fde-1b37-4168-a780-f1772c5924e3',
      resourceVersion: '379524',
      labels: {
        'app.kubernetes.io/managed-by': 'tekton-pipelines',
        'backstage.io/kubernetes-id': 'developer-portal',
        'janus-idp.io/tekton': 'developer-portal',
        'tekton.dev/clusterTask': 'tkn',
        'tekton.dev/memberOf': 'tasks',
        'tekton.dev/pipeline': 'test-pipeline',
        'tekton.dev/pipelineRun': 'test-pipeline-8e09zm',
        'tekton.dev/pipelineTask': 'task1',
        'tekton.dev/taskRun': 'test-pipeline-8e09zm-task1',
      },
    },
    spec: {
      volumes: [
        {
          name: 'tekton-internal-workspace',
          emptyDir: {},
        },
      ],
      containers: [
        {
          name: 'step-tkn',
        },
      ],
    },
    status: {
      phase: 'Succeeded',
      conditions: [],
      startTime: new Date('2023-12-08T12:19:29Z'),
    },
  },
  {
    metadata: {
      name: 'test-pipeline-8e09zm-sbom-task-pod',
      namespace: 'karthik',
      uid: '055cc13a-bd3e-414e-9eb6-e6cb72870578',
      resourceVersion: '379623',
      labels: {
        'backstage.io/kubernetes-id': 'developer-portal',
        'janus-idp.io/tekton': 'developer-portal',
        'tekton.dev/pipeline': 'test-pipeline',
        'tekton.dev/pipelineRun': 'test-pipeline-8e09zm',
        'tekton.dev/pipelineTask': 'sbom-task',
        'tekton.dev/task': 'sbom-task',
        'tekton.dev/taskRun': 'test-pipeline-8e09zm-sbom-task',
      },
    },
    spec: {
      containers: [
        {
          name: 'step-print-sbom-results',
        },
      ],
    },
    status: {
      phase: 'Succeeded',
      conditions: [],

      startTime: new Date('2023-12-08T12:19:38Z'),
    },
  },
];
