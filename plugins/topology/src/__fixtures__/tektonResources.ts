export const mockPipeline = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'Pipeline',
  metadata: {
    creationTimestamp: '2023-06-14T12:24:32Z' as any,
    generation: 1,
    labels: {
      'app.kubernetes.io/name': 'nationalparks-py2',
      'app.kubernetes.io/instance': 'test-deployment',
      'backstage.io/kubernetes-id': 'nationalparks-py',
      'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
      'pipeline.openshift.io/runtime': 'python',
      'pipeline.openshift.io/runtime-version': '3.9-ubi8',
      'pipeline.openshift.io/type': 'kubernetes',
    },
    name: 'nationalparks-py2',
    namespace: 'div',
    resourceVersion: '374385',
    uid: '4e9985fa-66b2-482d-9db9-0f117257c0e4',
  },
  spec: {
    params: [
      {
        default: 'nationalparks-py2',
        name: 'APP_NAME',
        type: 'string',
      },
      {
        default: 'https://github.com/temp-demo-organisation/nationalparks-py',
        name: 'GIT_REPO',
        type: 'string',
      },
      {
        default: '',
        name: 'GIT_REVISION',
        type: 'string',
      },
      {
        default:
          'image-registry.openshift-image-registry.svc:5000/div/nationalparks-py2',
        name: 'IMAGE_NAME',
        type: 'string',
      },
      {
        default: '.',
        name: 'PATH_CONTEXT',
        type: 'string',
      },
      {
        default: '3.9-ubi8',
        name: 'VERSION',
        type: 'string',
      },
    ],
    tasks: [
      {
        name: 'fetch-repository',
        params: [
          {
            name: 'url',
            value: '$(params.GIT_REPO)',
          },
          {
            name: 'revision',
            value: '$(params.GIT_REVISION)',
          },
          {
            name: 'subdirectory',
            value: '',
          },
          {
            name: 'deleteExisting',
            value: 'true',
          },
        ],
        taskRef: {
          kind: 'ClusterTask',
          name: 'git-clone',
        },
        workspaces: [
          {
            name: 'output',
            workspace: 'workspace',
          },
        ],
      },
      {
        name: 'build',
        params: [
          {
            name: 'IMAGE',
            value: '$(params.IMAGE_NAME)',
          },
          {
            name: 'TLSVERIFY',
            value: 'false',
          },
          {
            name: 'PATH_CONTEXT',
            value: '$(params.PATH_CONTEXT)',
          },
          {
            name: 'VERSION',
            value: '$(params.VERSION)',
          },
        ],
        runAfter: ['fetch-repository'],
        taskRef: {
          kind: 'ClusterTask',
          name: 's2i-python',
        },
        workspaces: [
          {
            name: 'source',
            workspace: 'workspace',
          },
        ],
      },
      {
        name: 'deploy',
        params: [
          {
            name: 'SCRIPT',
            value: 'oc rollout status deploy/$(params.APP_NAME)',
          },
        ],
        runAfter: ['build'],
        taskRef: {
          kind: 'ClusterTask',
          name: 'openshift-client',
        },
      },
    ],
    workspaces: [
      {
        name: 'workspace',
      },
    ],
  },
};

export const mockPipelineRun = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'PipelineRun',
  metadata: {
    annotations: {
      'pipeline.openshift.io/started-by': 'kube:admin',
    },
    resourceVersion: '467194',
    name: 'nationalparks-py2-8591xb',
    uid: '974e5124-c6b4-49c1-8960-d64740f47029',
    creationTimestamp: '2023-06-14T13:40:54Z',
    generation: 1,
    namespace: 'div',
    labels: {
      'app.kubernetes.io/name': 'nationalparks-py2',
      'app.kubernetes.io/instance': 'test-deployment',
      'backstage.io/kubernetes-id': 'nationalparks-py',
      'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
      'pipeline.openshift.io/runtime': 'python',
      'pipeline.openshift.io/runtime-version': '3.9-ubi8',
      'pipeline.openshift.io/type': 'kubernetes',
      'tekton.dev/pipeline': 'nationalparks-py2',
    },
  },
  spec: {
    params: [
      {
        name: 'APP_NAME',
        value: 'nationalparks-py2',
      },
      {
        name: 'GIT_REPO',
        value: 'https://github.com/temp-demo-organisation/nationalparks-py',
      },
      {
        name: 'GIT_REVISION',
        value: '',
      },
      {
        name: 'IMAGE_NAME',
        value:
          'image-registry.openshift-image-registry.svc:5000/div/nationalparks-py2',
      },
      {
        name: 'PATH_CONTEXT',
        value: '.',
      },
      {
        name: 'VERSION',
        value: '3.9-ubi8',
      },
    ],
    pipelineRef: {
      name: 'nationalparks-py2',
    },
    serviceAccountName: 'pipeline',
    timeout: '1h0m0s',
    workspaces: [
      {
        name: 'workspace',
        volumeClaimTemplate: {
          metadata: {
            creationTimestamp: null,
            labels: {
              'tekton.dev/pipeline': 'nationalparks-py2',
            },
          },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: '1Gi',
              },
            },
          },
          status: {},
        },
      },
    ],
  },
  status: {
    childReferences: [
      {
        apiVersion: 'tekton.dev/v1beta1',
        kind: 'TaskRun',
        name: 'nationalparks-py2-8591xb-fetch-repository',
        pipelineTaskName: 'fetch-repository',
      },
      {
        apiVersion: 'tekton.dev/v1beta1',
        kind: 'TaskRun',
        name: 'nationalparks-py2-8591xb-build',
        pipelineTaskName: 'build',
      },
      {
        apiVersion: 'tekton.dev/v1beta1',
        kind: 'TaskRun',
        name: 'nationalparks-py2-8591xb-deploy',
        pipelineTaskName: 'deploy',
      },
    ],
    completionTime: '2023-06-14T13:42:38Z',
    conditions: [
      {
        lastTransitionTime: '2023-06-14T13:42:38Z',
        message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    startTime: '2023-06-14T13:40:54Z',
  },
};
