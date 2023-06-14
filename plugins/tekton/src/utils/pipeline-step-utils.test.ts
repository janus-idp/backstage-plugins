import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { ComputedStatus } from '../types/computedStatus';
import { PipelineRunKind, PipelineTaskWithStatus } from '../types/pipelineRun';
import { createStepStatus } from './pipeline-step-utils';
import { getTaskStatus } from './pipelineRun-utils';

describe('createStepStatus', () => {
  it('should return the task step status', () => {
    let computedTask = mockKubernetesPlrResponse.pipelineruns[0].status
      .pipelineSpec.tasks[0] as PipelineTaskWithStatus;
    computedTask = {
      ...computedTask,
      status: {
        completionTime: '2023-04-12T10:20:18Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-12T10:20:18Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        podName: 'nodejs-ex-git-ez4iru-deploy-pod',
        startTime: '2023-04-12T10:20:11Z',
        steps: [
          {
            container: 'step-oc',
            imageID:
              'image-registry.openshift-image-registry.svc:5000/openshift/cli@sha256:d1b63fca6a4035a7fcacba436d778fc87bb8f4057ee3d43057b9c313b091b1ba',
            name: 'oc',
            terminated: {
              containerID:
                'cri-o://0ec330c543090c8678de1ff97bfa49fc839a1915fbf9a994c5b3e43f1f261799',
              exitCode: 0,
              finishedAt: '2023-04-12T10:20:18Z',
              reason: 'Completed',
              startedAt: '2023-04-12T10:20:17Z',
            },
          },
        ],
        taskSpec: {
          description:
            'This task runs commands against the cluster provided by user and if not provided then where the Task is being executed.\nOpenShift is a Kubernetes distribution from Red Hat which provides oc, the OpenShift CLI that complements kubectl for simplifying deployment and configuration applications on OpenShift.',
          params: [
            {
              default: 'oc help',
              description: 'The OpenShift CLI arguments to run',
              name: 'SCRIPT',
              type: 'string',
            },
            {
              default: 'latest',
              description: 'The OpenShift Version to use',
              name: 'VERSION',
              type: 'string',
            },
          ],
          steps: [
            {
              env: [
                {
                  name: 'HOME',
                  value: '/tekton/home',
                },
              ],
              image:
                'image-registry.openshift-image-registry.svc:5000/openshift/cli:latest',
              name: 'oc',
              resources: {},
              script: '',
            },
          ],
          workspaces: [
            {
              description:
                'The workspace which contains kubernetes manifests which we want to apply on the cluster.',
              name: 'manifest-dir',
              optional: true,
            },
            {
              description:
                'The workspace which contains the the kubeconfig file if in case we want to run the oc command on another cluster.',
              name: 'kubeconfig-dir',
              optional: true,
            },
          ],
        },
        duration: '7s',
        reason: 'Succeeded',
      },
    };
    const step = computedTask?.status?.steps?.[0] ?? { name: '' };
    const taskStatus = getTaskStatus(
      mockKubernetesPlrResponse.pipelineruns[0] as PipelineRunKind,
      computedTask,
    );
    const stepStatus = createStepStatus(step, taskStatus);
    expect(stepStatus).toEqual({
      duration: '1s',
      name: 'oc',
      status: 'Succeeded',
    });
  });

  it('should return proper status values when step and status objects have missing properties', () => {
    const stepStatus = createStepStatus(
      { name: '' },
      { reason: ComputedStatus.Other },
    );
    expect(stepStatus).toEqual({
      duration: undefined,
      name: '',
      status: '-',
    });
  });
});
