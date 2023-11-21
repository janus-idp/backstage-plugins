export const mockPLRResponseData = {
  pipelineruns: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube:admin',
        },
        creationTimestamp: new Date('2023-03-30T07:03:04Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'ruby-ex-git',
          'app.kubernetes.io/name': 'ruby-ex-git',
          'backstage.io/kubernetes-id': 'backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'pipeline.openshift.io/runtime': 'ruby',
          'pipeline.openshift.io/runtime-version': '3.0-ubi7',
          'pipeline.openshift.io/type': 'kubernetes',
          'tekton.dev/pipeline': 'ruby-ex-git',
        },
        name: 'ruby-ex-git-xf45fo',
        namespace: 'jai-test',
        resourceVersion: '87613',
        uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
      },
      spec: {
        params: [],
        pipelineRef: {
          name: 'ruby-ex-git',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-03-30T07:05:13Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:05:13Z',
            message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          params: [],
          tasks: [
            {
              name: 'fetch-repository',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'git-clone',
              },
              workspaces: [],
            },
            {
              name: 'build',
              params: [],
              runAfter: ['fetch-repository'],
              taskRef: {
                kind: 'ClusterTask',
                name: 's2i-ruby',
              },
              workspaces: [],
            },
            {
              name: 'deploy',
              params: [],
              runAfter: ['build'],
              taskRef: {
                kind: 'ClusterTask',
                name: 'openshift-client',
              },
            },
          ],
          workspaces: [],
        },
        startTime: '2023-03-30T07:03:04Z',
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube-admin',
        },
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
          'tekton.dev/pipeline': 'pipeline-test',
          'app.kubernetes.io/instance': 'abs',
          'app.kubernetes.io/name': 'ghg',
          'operator.tekton.dev/operand-name': 'ytui',
          'pipeline.openshift.io/runtime-version': 'hjkhk',
          'pipeline.openshift.io/type': 'hhu',
          'pipeline.openshift.io/runtime': 'node',
        },
        name: 'pipeline-test-wbvtlk',
        namespace: 'deb-test',
        resourceVersion: '117337',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
        creationTimestamp: new Date('2023-04-11T12:31:56Z'),
      },
      spec: {
        pipelineRef: {
          name: 'pipeline-test',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:49:05Z',
            message: 'Tasks Completed: 4 (Failed: 3, Cancelled 0), Skipped: 0',
            reason: 'Failed',
            status: 'False',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          finally: [],
          tasks: [],
          workspaces: [],
          startTime: '2023-04-11T06:48:50Z',
        },
      },
    },
  ],
  taskruns: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash':
            '63911846cb698608618c9a280f25b886ea3ee59f84a4ef6da15738a699e09f0c',
          'pipeline.openshift.io/started-by': 'kube:admin',
          'pipeline.tekton.dev/release': '9ec444e',
          'tekton.dev/displayName': 's2i ruby',
          'tekton.dev/pipelines.minVersion': '0.19',
          'tekton.dev/tags': 's2i, ruby, workspace',
        },
        creationTimestamp: new Date('2023-03-30T07:03:20Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'ruby-ex-git',
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/name': 'ruby-ex-git',
          'app.kubernetes.io/version': '0.1',
          'backstage.io/kubernetes-id': 'backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'pipeline.openshift.io/runtime': 'ruby',
          'pipeline.openshift.io/runtime-version': '3.0-ubi7',
          'pipeline.openshift.io/type': 'kubernetes',
          'tekton.dev/clusterTask': 's2i-ruby',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'ruby-ex-git',
          'tekton.dev/pipelineRun': 'ruby-ex-git-xf45fo',
          'tekton.dev/pipelineTask': 'build',
        },
        name: 'ruby-ex-git-xf45fo-build',
        namespace: 'jai-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'ruby-ex-git-xf45fo',
            uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
          },
        ],
        resourceVersion: '87287',
        uid: 'e8d42c4a-b9c7-4f56-9482-d17f2c861804',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 's2i-ruby',
        },
        timeout: '1h0m0s',
        workspaces: [],
      },
      status: {
        completionTime: '2023-03-30T07:04:55Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:04:55Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        podName: 'ruby-ex-git-xf45fo-build-pod',
        startTime: '2023-03-30T07:03:20Z',
        steps: [
          {
            container: 'step-generate',
            imageID:
              'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
            name: 'generate',
            terminated: {
              containerID:
                'cri-o://3b490fe8f5ed9310fa7b322961e2069b3548a6a8134693ef78c12c8c0760ea0c',
              exitCode: 0,
              finishedAt: '2023-03-30T07:03:30Z',
              reason: 'Completed',
              startedAt: '2023-03-30T07:03:30Z',
            },
          },
          {
            container: 'step-build-and-push',
            imageID:
              'registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d',
            name: 'build-and-push',
            terminated: {
              containerID:
                'cri-o://90521ea2114ca3fc6b54216fe8cff26b679788d1c87dee40b98caa90f71e140e',
              exitCode: 0,
              finishedAt: '2023-03-30T07:04:54Z',
              message:
                '[{"key":"IMAGE_DIGEST","value":"sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02","type":1}]',
              reason: 'Completed',
              startedAt: '2023-03-30T07:03:30Z',
            },
          },
        ],
        taskSpec: {
          description:
            's2i-ruby task clones a Git repository and builds and pushes a container image using S2I and a Ruby builder image.',
          params: [],
          results: [],
          steps: [
            {
              env: [],
              image:
                'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
              name: 'generate',
              resources: {},
              script: 'echo',
              volumeMounts: [],
              workingDir: '/workspace/source',
            },
            {
              image:
                'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
              name: 'build-and-push',
              resources: {},
              script: 'echo',
              securityContext: {
                capabilities: {
                  add: ['SETFCAP'],
                },
              },
              volumeMounts: [],
              workingDir: '/gen-source',
            },
          ],
          volumes: [],
          workspaces: [],
        },
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash': 'undefined',
          'pipeline.openshift.io/started-by': 'undefined',
          'pipeline.tekton.dev/release': 'undefined',
          'tekton.dev/displayName': 'undefined',
          'tekton.dev/pipelines.minVersion': 'undefined',
          'tekton.dev/tags': 'undefined',
        },
        creationTimestamp: new Date('2023-04-11T06:48:50Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/version': '0.4',
          'backstage.io/kubernetes-id': 'test-backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'tekton.dev/clusterTask': 'tkn',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'pipeline-test',
          'tekton.dev/pipelineRun': 'pipeline-test-wbvtlk',
          'tekton.dev/pipelineTask': 'tkn',
          'app.kubernetes.io/instance': 'xyz',
          'app.kubernetes.io/name': 'xyz',
          'pipeline.openshift.io/runtime': 'node',
          'pipeline.openshift.io/runtime-version': 'gh',
          'pipeline.openshift.io/type': 'abc',
        },
        name: 'pipeline-test-wbvtlk-tkn',
        namespace: 'deb-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'pipeline-test-wbvtlk',
            uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
          },
        ],
        resourceVersion: '117189',
        uid: 'cb08cb7d-71fc-48a7-888f-4ad14a7277b9',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 'tkn',
        },
        timeout: '1h0m0s',
      },
      status: {
        completionTime: '2023-04-11T06:48:56Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:48:56Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'Unknown',
            type: 'Succeeded',
          },
        ],
        podName: 'pipeline-test-wbvtlk-tkn-pod',
        startTime: '2023-04-11T06:48:50Z',
        steps: [
          {
            container: 'step-tkn',
            imageID:
              'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
            name: 'tkn',
            terminated: {
              containerID:
                'cri-o://53fbddbb25c08e97d0061a3dd79021e8d411485bbc3f18cfcffd41ae3448c0d2',
              exitCode: 0,
              finishedAt: '2023-04-11T06:48:56Z',
              reason: 'Completed',
              startedAt: '2023-04-11T06:48:56Z',
            },
          },
        ],
        taskSpec: {
          description:
            'This task performs operations on Tekton resources using tkn',
          params: [],
          steps: [
            {
              args: ['--help'],
              env: [],
              image:
                'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
              name: 'tkn',
              resources: {},
            },
          ],
          workspaces: [],
        },
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash': 'undefined',
          'pipeline.openshift.io/started-by': 'undefined',
          'pipeline.tekton.dev/release': 'undefined',
          'tekton.dev/displayName': 'undefined',
          'tekton.dev/pipelines.minVersion': 'undefined',
          'tekton.dev/tags': 'undefined',
        },
        creationTimestamp: new Date('2023-04-11T06:48:58Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/version': '0.8',
          'backstage.io/kubernetes-id': 'test-backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'tekton.dev/clusterTask': 'git-clone',
          'tekton.dev/memberOf': 'finally',
          'tekton.dev/pipeline': 'pipeline-test',
          'tekton.dev/pipelineRun': 'pipeline-test-wbvtlk',
          'tekton.dev/pipelineTask': 'git-clone',
          'app.kubernetes.io/instance': 'xyz',
          'app.kubernetes.io/name': 'xyz',
          'pipeline.openshift.io/runtime': 'node',
          'pipeline.openshift.io/runtime-version': 'gh',
          'pipeline.openshift.io/type': 'abc',
        },
        name: 'pipeline-test-wbvtlk-git-clone',
        namespace: 'deb-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'pipeline-test-wbvtlk',
            uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
          },
        ],
        resourceVersion: '117335',
        uid: 'a3e4a1a9-605a-490d-82c1-9042bf6ec86e',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 'git-clone',
        },
        timeout: '1h0m0s',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:49:05Z',
            message:
              '"step-clone" exited with code 1 (image: "registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9"); for logs run: kubectl -n deb-test logs pipeline-test-wbvtlk-git-clone-pod -c step-clone\n',
            reason: 'Failed',
            status: 'False',
            type: 'Succeeded',
          },
        ],
        podName: 'pipeline-test-wbvtlk-git-clone-pod',
        startTime: '2023-04-11T06:48:58Z',
        steps: [
          {
            container: 'step-clone',
            imageID:
              'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
            name: 'clone',
            terminated: {
              containerID:
                'cri-o://b727febb4b981471a5729cf6002d59d31673d25280192e7dc0ea09de113743dd',
              exitCode: 1,
              finishedAt: '2023-04-11T06:49:04Z',
              reason: 'Error',
              startedAt: '2023-04-11T06:49:04Z',
            },
          },
        ],
        taskSpec: {
          description:
            "These Tasks are Git tasks to work with repositories used by other tasks in your Pipeline.\nThe git-clone Task will clone a repo from the provided url into the output Workspace. By default the repo will be cloned into the root of your Workspace. You can clone into a subdirectory by setting this Task's subdirectory param. This Task also supports sparse checkouts. To perform a sparse checkout, pass a list of comma separated directory patterns to this Task's sparseCheckoutDirectories param.",
          params: [],
          steps: [
            {
              env: [],
              image:
                'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
              name: 'clone',
              resources: {},
            },
          ],
          workspaces: [],
        },
      },
    },
  ],
};
