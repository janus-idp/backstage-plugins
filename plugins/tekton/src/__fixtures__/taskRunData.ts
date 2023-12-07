import { TaskRunKind } from '@janus-idp/shared-react';

import { TEKTON_PIPELINE_RUN } from '../consts/tekton-const';

export const taskRunWithResults: TaskRunKind = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'TaskRun',
  metadata: {
    name: 'test-tr',
    namespace: 'test-ns',
    labels: {
      'tekton.dev/pipelineRun': 'test-plr',
    },
  },
  spec: {
    params: [
      {
        name: 'first',
        value: '20',
      },
      {
        name: 'second',
        value: '10',
      },
    ],
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'add-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: 'Mon Mar 27 2023 18:09:11',
    startTime: 'Mon Mar 27 2023 18:08:19',
    podName: 'sum-three-pipeline-run-second-add-al6kxl-deploy-pod',
    conditions: [
      {
        lastTransitionTime: '2021-02-09T09:57:03Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    taskResults: [
      {
        name: 'sum',
        value: '30',
      },
      {
        name: 'difference',
        value: '10',
      },
      {
        name: 'multiply',
        value: '200',
      },
      {
        name: 'divide',
        value: '2',
      },
    ],
  },
};

export const taskRunWithSBOMResult = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelinerun-with-sbom-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'task.output.location': 'results',
      'task.results.format': 'application/text',
      'task.results.key': 'LINK_TO_SBOM',
    },
    labels: {
      [TEKTON_PIPELINE_RUN]: 'test-plr',
    },
    name: 'pipelinerun-with-sbom-task-t237ev-sbom-task',
    uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'sbom-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelinerun-with-sbom-task-t237ev-sbom-task-pod',
    results: [
      {
        name: 'LINK_TO_SBOM',
        type: 'string',
        value: 'quay.io/test/image:build-8e536-1692702836',
      },
    ],
  },
};

export const taskRunWithSBOMResultExternalLink: TaskRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelinerun-with-sbom-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'pipeline.tekton.dev/release': 'a2f17f6',
      'task.output.location': 'results',
      'task.results.format': 'application/text',
      'task.results.type': 'external-link',
      'task.results.key': 'LINK_TO_SBOM',
    },
    resourceVersion: '197373',
    name: 'pipelinerun-with-sbom-task-t237ev-sbom-task',
    uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
    generation: 1,
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'sbom-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelinerun-with-sbom-task-t237ev-sbom-task-pod',
    results: [
      {
        name: 'LINK_TO_SBOM',
        type: 'string',
        value: 'http://quay.io/test/image:build-8e536-1692702836',
      },
    ],
  },
};
