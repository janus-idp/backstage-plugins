export const mockKubernetesPlrResponse = {
  pods: [
    {
      metadata: {
        name: 'ruby-ex-git-66d547b559-bk5hz',
        generateName: 'ruby-ex-git-66d547b559-',
        namespace: 'jai-test',
        uid: 'cec5c859-3557-49aa-89db-d287f94d1ad8',
        resourceVersion: '87565',
        creationTimestamp: new Date('2023-03-30T07:04:54Z'),
        labels: {
          app: 'ruby-ex-git',
          'backstage.io/kubernetes-id': 'backstage',
          deployment: 'ruby-ex-git',
          'pod-template-hash': '66d547b559',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'ruby-ex-git-66d547b559',
            uid: '8a781d94-c73d-4f07-8d1f-b797db949e4a',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-hzpnl',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
                {
                  configMap: {
                    name: 'openshift-service-ca.crt',
                    items: [
                      {
                        key: 'service-ca.crt',
                        path: 'service-ca.crt',
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'ruby-ex-git',
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git@sha256:ade428dd4cb303a2ab9f1e0d5a6a86d6c035655d14f989e856f11bf3baef9bf2',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-hzpnl',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
            securityContext: {
              capabilities: {
                drop: ['ALL'],
              },
              runAsUser: 1000690000,
              runAsNonRoot: true,
              allowPrivilegeEscalation: false,
            },
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'ip-10-0-170-221.us-east-2.compute.internal',
        securityContext: {
          seLinuxOptions: {
            level: 's0:c26,c20',
          },
          fsGroup: 1000690000,
          seccompProfile: {
            type: 'RuntimeDefault',
          },
        },
        imagePullSecrets: [
          {
            name: 'default-dockercfg-wtjl6',
          },
        ],
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:04:54Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:05:12Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:05:12Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:04:54Z',
          },
        ],
        startTime: '2023-03-30T07:04:54Z',
        containerStatuses: [
          {
            name: 'ruby-ex-git',
            state: {
              running: {
                startedAt: '2023-03-30T07:05:11Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git@sha256:ade428dd4cb303a2ab9f1e0d5a6a86d6c035655d14f989e856f11bf3baef9bf2',
            imageID:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git@sha256:ade428dd4cb303a2ab9f1e0d5a6a86d6c035655d14f989e856f11bf3baef9bf2',
            containerID:
              'cri-o://85af7fd408b95c3800ea83349541f10bf888903d0a1e19378489724b9a718607',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
  ],
  pipelineruns: [
    {
      apiVersion: 'tekton.dev/v1beta1',
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
        params: [
          {
            name: 'APP_NAME',
            value: 'ruby-ex-git',
          },
          {
            name: 'GIT_REPO',
            value: 'https://github.com/sclorg/ruby-ex.git',
          },
          {
            name: 'GIT_REVISION',
            value: '',
          },
          {
            name: 'IMAGE_NAME',
            value:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git',
          },
          {
            name: 'PATH_CONTEXT',
            value: '.',
          },
          {
            name: 'VERSION',
            value: '3.0-ubi7',
          },
        ],
        pipelineRef: {
          name: 'ruby-ex-git',
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
                  'tekton.dev/pipeline': 'ruby-ex-git',
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
          params: [
            {
              default: 'ruby-ex-git',
              name: 'APP_NAME',
              type: 'string',
            },
            {
              default: 'https://github.com/sclorg/ruby-ex.git',
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
                'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git',
              name: 'IMAGE_NAME',
              type: 'string',
            },
            {
              default: '.',
              name: 'PATH_CONTEXT',
              type: 'string',
            },
            {
              default: '3.0-ubi7',
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
                  value: 'https://github.com/sclorg/ruby-ex.git',
                },
                {
                  name: 'revision',
                  value: '',
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
                  value:
                    'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git',
                },
                {
                  name: 'TLSVERIFY',
                  value: 'false',
                },
                {
                  name: 'PATH_CONTEXT',
                  value: '.',
                },
                {
                  name: 'VERSION',
                  value: '3.0-ubi7',
                },
              ],
              runAfter: ['fetch-repository'],
              taskRef: {
                kind: 'ClusterTask',
                name: 's2i-ruby',
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
                  value: 'oc rollout status deploy/ruby-ex-git',
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
        startTime: '2023-03-30T07:03:04Z',
        taskRuns: {
          'ruby-ex-git-xf45fo-build': {
            pipelineTaskName: 'build',
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
              taskResults: [
                {
                  name: 'IMAGE_DIGEST',
                  type: 'string',
                  value:
                    'sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02',
                },
              ],
              taskSpec: {
                description:
                  's2i-ruby task clones a Git repository and builds and pushes a container image using S2I and a Ruby builder image.',
                params: [
                  {
                    default: 'latest',
                    description: 'The tag of ruby imagestream for ruby version',
                    name: 'VERSION',
                    type: 'string',
                  },
                  {
                    default: '.',
                    description: 'The location of the path to run s2i from.',
                    name: 'PATH_CONTEXT',
                    type: 'string',
                  },
                  {
                    default: 'true',
                    description:
                      'Verify the TLS on the registry endpoint (for push/pull to a non-TLS registry)',
                    name: 'TLSVERIFY',
                    type: 'string',
                  },
                  {
                    description:
                      'Location of the repo where image has to be pushed',
                    name: 'IMAGE',
                    type: 'string',
                  },
                  {
                    default:
                      'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
                    description: 'The location of the buildah builder image.',
                    name: 'BUILDER_IMAGE',
                    type: 'string',
                  },
                  {
                    default: 'false',
                    description: 'Skip pushing the built image',
                    name: 'SKIP_PUSH',
                    type: 'string',
                  },
                  {
                    default: [],
                    description:
                      'Environment variables to set during _build-time_.',
                    name: 'ENV_VARS',
                    type: 'array',
                  },
                ],
                results: [
                  {
                    description: 'Digest of the image just built.',
                    name: 'IMAGE_DIGEST',
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
                      'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
                    name: 'generate',
                    resources: {},
                    script:
                      'echo "Processing Build Environment Variables"\necho "" > /env-vars/env-file\nfor var in "$@"\ndo\n    echo "$var" >> /env-vars/env-file\ndone\n\ns2i build . image-registry.openshift-image-registry.svc:5000/openshift/ruby:3.0-ubi7 \\\n--as-dockerfile /gen-source/Dockerfile.gen --environment-file /env-vars/env-file\n',
                    volumeMounts: [
                      {
                        mountPath: '/gen-source',
                        name: 'gen-source',
                      },
                      {
                        mountPath: '/env-vars',
                        name: 'env-vars',
                      },
                    ],
                    workingDir: '/workspace/source',
                  },
                  {
                    image:
                      'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
                    name: 'build-and-push',
                    resources: {},
                    script:
                      'buildah bud --storage-driver=vfs --tls-verify=false \\\n   --layers -f /gen-source/Dockerfile.gen -t image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git .\n\n[[ "false" == "true" ]] && echo "Push skipped" && exit 0\n[[ "false" == "true" ]] && export DOCKER_CONFIG=""\nbuildah push --storage-driver=vfs --tls-verify=false \\\n  --digestfile /workspace/source/image-digest image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git \\\n  docker://image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git\n\ncat /workspace/source/image-digest | tee /tekton/results/IMAGE_DIGEST\n',
                    securityContext: {
                      capabilities: {
                        add: ['SETFCAP'],
                      },
                    },
                    volumeMounts: [
                      {
                        mountPath: '/var/lib/containers',
                        name: 'varlibcontainers',
                      },
                      {
                        mountPath: '/gen-source',
                        name: 'gen-source',
                      },
                    ],
                    workingDir: '/gen-source',
                  },
                ],
                volumes: [
                  {
                    emptyDir: {},
                    name: 'varlibcontainers',
                  },
                  {
                    emptyDir: {},
                    name: 'gen-source',
                  },
                  {
                    emptyDir: {},
                    name: 'env-vars',
                  },
                ],
                workspaces: [
                  {
                    mountPath: '/workspace/source',
                    name: 'source',
                  },
                  {
                    description:
                      'An optional workspace that allows providing a .docker/config.json file for Buildah to access the container registry. The file should be placed at the root of the Workspace with name config.json.',
                    name: 'dockerconfig',
                    optional: true,
                  },
                ],
              },
            },
          },
          'ruby-ex-git-xf45fo-deploy': {
            pipelineTaskName: 'deploy',
            status: {
              completionTime: '2023-03-30T07:05:13Z',
              conditions: [
                {
                  lastTransitionTime: '2023-03-30T07:05:13Z',
                  message: 'All Steps have completed executing',
                  reason: 'Succeeded',
                  status: 'True',
                  type: 'Succeeded',
                },
              ],
              podName: 'ruby-ex-git-xf45fo-deploy-pod',
              startTime: '2023-03-30T07:04:55Z',
              steps: [
                {
                  container: 'step-oc',
                  imageID:
                    'image-registry.openshift-image-registry.svc:5000/openshift/cli@sha256:e2f0217ba0ea40703b104c1a70e8ecbcc6ba997041fff68467214f5ba87b52b6',
                  name: 'oc',
                  terminated: {
                    containerID:
                      'cri-o://1cf6af84b780655695cfba670fb8a6dad774667925eda98eda6e8f0400ef1723',
                    exitCode: 0,
                    finishedAt: '2023-03-30T07:05:12Z',
                    reason: 'Completed',
                    startedAt: '2023-03-30T07:05:02Z',
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
                    script:
                      '#!/usr/bin/env bash\n\n[[ "false" == "true" ]] && \\\ncd \n\n[[ "false" == "true" ]] && \\\n[[ -f /kubeconfig ]] && \\\nexport KUBECONFIG=/kubeconfig\n\noc rollout status deploy/ruby-ex-git\n',
                    securityContext: {
                      runAsNonRoot: true,
                      runAsUser: 65532,
                    },
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
            },
          },
          'ruby-ex-git-xf45fo-fetch-repository': {
            pipelineTaskName: 'fetch-repository',
            status: {
              completionTime: '2023-03-30T07:03:20Z',
              conditions: [
                {
                  lastTransitionTime: '2023-03-30T07:03:20Z',
                  message: 'All Steps have completed executing',
                  reason: 'Succeeded',
                  status: 'True',
                  type: 'Succeeded',
                },
              ],
              podName: 'ruby-ex-git-xf45fo-fetch-repository-pod',
              startTime: '2023-03-30T07:03:05Z',
              steps: [
                {
                  container: 'step-clone',
                  imageID:
                    'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                  name: 'clone',
                  terminated: {
                    containerID:
                      'cri-o://8937c0bc0cd043d09395b85bffee7010624f26d5345141ff988b618a60027e48',
                    exitCode: 0,
                    finishedAt: '2023-03-30T07:03:20Z',
                    message:
                      '[{"key":"commit","value":"01effef3a23935c1a83110d4b074b0738d677c44","type":1},{"key":"url","value":"https://github.com/sclorg/ruby-ex.git","type":1}]',
                    reason: 'Completed',
                    startedAt: '2023-03-30T07:03:20Z',
                  },
                },
              ],
              taskResults: [
                {
                  name: 'commit',
                  type: 'string',
                  value: '01effef3a23935c1a83110d4b074b0738d677c44',
                },
                {
                  name: 'url',
                  type: 'string',
                  value: 'https://github.com/sclorg/ruby-ex.git',
                },
              ],
              taskSpec: {
                description:
                  "These Tasks are Git tasks to work with repositories used by other tasks in your Pipeline.\nThe git-clone Task will clone a repo from the provided url into the output Workspace. By default the repo will be cloned into the root of your Workspace. You can clone into a subdirectory by setting this Task's subdirectory param. This Task also supports sparse checkouts. To perform a sparse checkout, pass a list of comma separated directory patterns to this Task's sparseCheckoutDirectories param.",
                params: [
                  {
                    description: 'Repository URL to clone from.',
                    name: 'url',
                    type: 'string',
                  },
                  {
                    default: '',
                    description:
                      'Revision to checkout. (branch, tag, sha, ref, etc...)',
                    name: 'revision',
                    type: 'string',
                  },
                  {
                    default: '',
                    description:
                      'Refspec to fetch before checking out revision.',
                    name: 'refspec',
                    type: 'string',
                  },
                  {
                    default: 'true',
                    description: 'Initialize and fetch git submodules.',
                    name: 'submodules',
                    type: 'string',
                  },
                  {
                    default: '1',
                    description:
                      'Perform a shallow clone, fetching only the most recent N commits.',
                    name: 'depth',
                    type: 'string',
                  },
                  {
                    default: 'true',
                    description:
                      'Set the `http.sslVerify` global git config. Setting this to `false` is not advised unless you are sure that you trust your git remote.',
                    name: 'sslVerify',
                    type: 'string',
                  },
                  {
                    default: 'ca-bundle.crt',
                    description:
                      'file name of mounted crt using ssl-ca-directory workspace. default value is ca-bundle.crt.',
                    name: 'crtFileName',
                    type: 'string',
                  },
                  {
                    default: '',
                    description:
                      'Subdirectory inside the `output` Workspace to clone the repo into.',
                    name: 'subdirectory',
                    type: 'string',
                  },
                  {
                    default: '',
                    description:
                      'Define the directory patterns to match or exclude when performing a sparse checkout.',
                    name: 'sparseCheckoutDirectories',
                    type: 'string',
                  },
                  {
                    default: 'true',
                    description:
                      'Clean out the contents of the destination directory if it already exists before cloning.',
                    name: 'deleteExisting',
                    type: 'string',
                  },
                  {
                    default: '',
                    description: 'HTTP proxy server for non-SSL requests.',
                    name: 'httpProxy',
                    type: 'string',
                  },
                  {
                    default: '',
                    description: 'HTTPS proxy server for SSL requests.',
                    name: 'httpsProxy',
                    type: 'string',
                  },
                  {
                    default: '',
                    description: 'Opt out of proxying HTTP/HTTPS requests.',
                    name: 'noProxy',
                    type: 'string',
                  },
                  {
                    default: 'true',
                    description:
                      "Log the commands that are executed during `git-clone`'s operation.",
                    name: 'verbose',
                    type: 'string',
                  },
                  {
                    default:
                      'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                    description:
                      'The image providing the git-init binary that this Task runs.',
                    name: 'gitInitImage',
                    type: 'string',
                  },
                  {
                    default: '/tekton/home',
                    description:
                      "Absolute path to the user's home directory.\n",
                    name: 'userHome',
                    type: 'string',
                  },
                ],
                results: [
                  {
                    description:
                      'The precise commit SHA that was fetched by this Task.',
                    name: 'commit',
                    type: 'string',
                  },
                  {
                    description:
                      'The precise URL that was fetched by this Task.',
                    name: 'url',
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
                      {
                        name: 'PARAM_URL',
                        value: 'https://github.com/sclorg/ruby-ex.git',
                      },
                      {
                        name: 'PARAM_REVISION',
                      },
                      {
                        name: 'PARAM_REFSPEC',
                      },
                      {
                        name: 'PARAM_SUBMODULES',
                        value: 'true',
                      },
                      {
                        name: 'PARAM_DEPTH',
                        value: '1',
                      },
                      {
                        name: 'PARAM_SSL_VERIFY',
                        value: 'true',
                      },
                      {
                        name: 'PARAM_CRT_FILENAME',
                        value: 'ca-bundle.crt',
                      },
                      {
                        name: 'PARAM_SUBDIRECTORY',
                      },
                      {
                        name: 'PARAM_DELETE_EXISTING',
                        value: 'true',
                      },
                      {
                        name: 'PARAM_HTTP_PROXY',
                      },
                      {
                        name: 'PARAM_HTTPS_PROXY',
                      },
                      {
                        name: 'PARAM_NO_PROXY',
                      },
                      {
                        name: 'PARAM_VERBOSE',
                        value: 'true',
                      },
                      {
                        name: 'PARAM_SPARSE_CHECKOUT_DIRECTORIES',
                      },
                      {
                        name: 'PARAM_USER_HOME',
                        value: '/tekton/home',
                      },
                      {
                        name: 'WORKSPACE_OUTPUT_PATH',
                        value: '/workspace/output',
                      },
                      {
                        name: 'WORKSPACE_SSH_DIRECTORY_BOUND',
                        value: 'false',
                      },
                      {
                        name: 'WORKSPACE_SSH_DIRECTORY_PATH',
                      },
                      {
                        name: 'WORKSPACE_BASIC_AUTH_DIRECTORY_BOUND',
                        value: 'false',
                      },
                      {
                        name: 'WORKSPACE_BASIC_AUTH_DIRECTORY_PATH',
                      },
                      {
                        name: 'WORKSPACE_SSL_CA_DIRECTORY_BOUND',
                        value: 'false',
                      },
                      {
                        name: 'WORKSPACE_SSL_CA_DIRECTORY_PATH',
                      },
                    ],
                    image:
                      'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                    name: 'clone',
                    resources: {},
                    script:
                      '#!/usr/bin/env sh\nset -eu\n\nif [ "${PARAM_VERBOSE}" = "true" ] ; then\n  set -x\nfi\n\n\nif [ "${WORKSPACE_BASIC_AUTH_DIRECTORY_BOUND}" = "true" ] ; then\n  cp "${WORKSPACE_BASIC_AUTH_DIRECTORY_PATH}/.git-credentials" "${PARAM_USER_HOME}/.git-credentials"\n  cp "${WORKSPACE_BASIC_AUTH_DIRECTORY_PATH}/.gitconfig" "${PARAM_USER_HOME}/.gitconfig"\n  chmod 400 "${PARAM_USER_HOME}/.git-credentials"\n  chmod 400 "${PARAM_USER_HOME}/.gitconfig"\nfi\n\nif [ "${WORKSPACE_SSH_DIRECTORY_BOUND}" = "true" ] ; then\n  cp -R "${WORKSPACE_SSH_DIRECTORY_PATH}" "${PARAM_USER_HOME}"/.ssh\n  chmod 700 "${PARAM_USER_HOME}"/.ssh\n  chmod -R 400 "${PARAM_USER_HOME}"/.ssh/*\nfi\n\nif [ "${WORKSPACE_SSL_CA_DIRECTORY_BOUND}" = "true" ] ; then\n   export GIT_SSL_CAPATH="${WORKSPACE_SSL_CA_DIRECTORY_PATH}"\n   if [ "${PARAM_CRT_FILENAME}" != "" ] ; then\n      export GIT_SSL_CAINFO="${WORKSPACE_SSL_CA_DIRECTORY_PATH}/${PARAM_CRT_FILENAME}"\n   fi\nfi\nCHECKOUT_DIR="${WORKSPACE_OUTPUT_PATH}/${PARAM_SUBDIRECTORY}"\n\ncleandir() {\n  # Delete any existing contents of the repo directory if it exists.\n  #\n  # We don\'t just "rm -rf ${CHECKOUT_DIR}" because ${CHECKOUT_DIR} might be "/"\n  # or the root of a mounted volume.\n  if [ -d "${CHECKOUT_DIR}" ] ; then\n    # Delete non-hidden files and directories\n    rm -rf "${CHECKOUT_DIR:?}"/*\n    # Delete files and directories starting with . but excluding ..\n    rm -rf "${CHECKOUT_DIR}"/.[!.]*\n    # Delete files and directories starting with .. plus any other character\n    rm -rf "${CHECKOUT_DIR}"/..?*\n  fi\n}\n\nif [ "${PARAM_DELETE_EXISTING}" = "true" ] ; then\n  cleandir\nfi\n\ntest -z "${PARAM_HTTP_PROXY}" || export HTTP_PROXY="${PARAM_HTTP_PROXY}"\ntest -z "${PARAM_HTTPS_PROXY}" || export HTTPS_PROXY="${PARAM_HTTPS_PROXY}"\ntest -z "${PARAM_NO_PROXY}" || export NO_PROXY="${PARAM_NO_PROXY}"\n\n/ko-app/git-init \\\n  -url="${PARAM_URL}" \\\n  -revision="${PARAM_REVISION}" \\\n  -refspec="${PARAM_REFSPEC}" \\\n  -path="${CHECKOUT_DIR}" \\\n  -sslVerify="${PARAM_SSL_VERIFY}" \\\n  -submodules="${PARAM_SUBMODULES}" \\\n  -depth="${PARAM_DEPTH}" \\\n  -sparseCheckoutDirectories="${PARAM_SPARSE_CHECKOUT_DIRECTORIES}"\ncd "${CHECKOUT_DIR}"\nRESULT_SHA="$(git rev-parse HEAD)"\nEXIT_CODE="$?"\nif [ "${EXIT_CODE}" != 0 ] ; then\n  exit "${EXIT_CODE}"\nfi\nprintf "%s" "${RESULT_SHA}" > "/tekton/results/commit"\nprintf "%s" "${PARAM_URL}" > "/tekton/results/url"\n',
                    securityContext: {
                      runAsNonRoot: true,
                      runAsUser: 65532,
                    },
                  },
                ],
                workspaces: [
                  {
                    description:
                      'The git repo will be cloned onto the volume backing this Workspace.',
                    name: 'output',
                  },
                  {
                    description:
                      "A .ssh directory with private key, known_hosts, config, etc. Copied to\nthe user's home before git commands are executed. Used to authenticate\nwith the git remote when performing the clone. Binding a Secret to this\nWorkspace is strongly recommended over other volume types.\n",
                    name: 'ssh-directory',
                    optional: true,
                  },
                  {
                    description:
                      "A Workspace containing a .gitconfig and .git-credentials file. These\nwill be copied to the user's home before any git commands are run. Any\nother files in this Workspace are ignored. It is strongly recommended\nto use ssh-directory over basic-auth whenever possible and to bind a\nSecret to this Workspace over other volume types.\n",
                    name: 'basic-auth',
                    optional: true,
                  },
                  {
                    description:
                      'A workspace containing CA certificates, this will be used by Git to\nverify the peer with when fetching or pushing over HTTPS.\n',
                    name: 'ssl-ca-directory',
                    optional: true,
                  },
                ],
              },
            },
          },
        },
      },
    },
  ],
  taskruns: [
    {
      apiVersion: 'tekton.dev/v1beta1',
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
            apiVersion: 'tekton.dev/v1beta1',
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
        params: [
          {
            name: 'IMAGE',
            value:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git',
          },
          {
            name: 'TLSVERIFY',
            value: 'false',
          },
          {
            name: 'PATH_CONTEXT',
            value: '.',
          },
          {
            name: 'VERSION',
            value: '3.0-ubi7',
          },
        ],
        resources: {},
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 's2i-ruby',
        },
        timeout: '1h0m0s',
        workspaces: [
          {
            name: 'source',
            persistentVolumeClaim: {
              claimName: 'pvc-f7934bb0ae',
            },
          },
        ],
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
        taskResults: [
          {
            name: 'IMAGE_DIGEST',
            type: 'string',
            value:
              'sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02',
          },
        ],
        taskSpec: {
          description:
            's2i-ruby task clones a Git repository and builds and pushes a container image using S2I and a Ruby builder image.',
          params: [
            {
              default: 'latest',
              description: 'The tag of ruby imagestream for ruby version',
              name: 'VERSION',
              type: 'string',
            },
            {
              default: '.',
              description: 'The location of the path to run s2i from.',
              name: 'PATH_CONTEXT',
              type: 'string',
            },
            {
              default: 'true',
              description:
                'Verify the TLS on the registry endpoint (for push/pull to a non-TLS registry)',
              name: 'TLSVERIFY',
              type: 'string',
            },
            {
              description: 'Location of the repo where image has to be pushed',
              name: 'IMAGE',
              type: 'string',
            },
            {
              default:
                'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
              description: 'The location of the buildah builder image.',
              name: 'BUILDER_IMAGE',
              type: 'string',
            },
            {
              default: 'false',
              description: 'Skip pushing the built image',
              name: 'SKIP_PUSH',
              type: 'string',
            },
            {
              default: [],
              description: 'Environment variables to set during _build-time_.',
              name: 'ENV_VARS',
              type: 'array',
            },
          ],
          results: [
            {
              description: 'Digest of the image just built.',
              name: 'IMAGE_DIGEST',
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
                'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
              name: 'generate',
              resources: {},
              script:
                'echo "Processing Build Environment Variables"\necho "" > /env-vars/env-file\nfor var in "$@"\ndo\n    echo "$var" >> /env-vars/env-file\ndone\n\ns2i build . image-registry.openshift-image-registry.svc:5000/openshift/ruby:3.0-ubi7 \\\n--as-dockerfile /gen-source/Dockerfile.gen --environment-file /env-vars/env-file\n',
              volumeMounts: [
                {
                  mountPath: '/gen-source',
                  name: 'gen-source',
                },
                {
                  mountPath: '/env-vars',
                  name: 'env-vars',
                },
              ],
              workingDir: '/workspace/source',
            },
            {
              image:
                'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
              name: 'build-and-push',
              resources: {},
              script:
                'buildah bud --storage-driver=vfs --tls-verify=false \\\n   --layers -f /gen-source/Dockerfile.gen -t image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git .\n\n[[ "false" == "true" ]] && echo "Push skipped" && exit 0\n[[ "false" == "true" ]] && export DOCKER_CONFIG=""\nbuildah push --storage-driver=vfs --tls-verify=false \\\n  --digestfile /workspace/source/image-digest image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git \\\n  docker://image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git\n\ncat /workspace/source/image-digest | tee /tekton/results/IMAGE_DIGEST\n',
              securityContext: {
                capabilities: {
                  add: ['SETFCAP'],
                },
              },
              volumeMounts: [
                {
                  mountPath: '/var/lib/containers',
                  name: 'varlibcontainers',
                },
                {
                  mountPath: '/gen-source',
                  name: 'gen-source',
                },
              ],
              workingDir: '/gen-source',
            },
          ],
          volumes: [
            {
              emptyDir: {},
              name: 'varlibcontainers',
            },
            {
              emptyDir: {},
              name: 'gen-source',
            },
            {
              emptyDir: {},
              name: 'env-vars',
            },
          ],
          workspaces: [
            {
              mountPath: '/workspace/source',
              name: 'source',
            },
            {
              description:
                'An optional workspace that allows providing a .docker/config.json file for Buildah to access the container registry. The file should be placed at the root of the Workspace with name config.json.',
              name: 'dockerconfig',
              optional: true,
            },
          ],
        },
      },
    },
  ],
};
