export const mockKubernetesResponse = {
  pods: [
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world-bfb8bb77-vrptd',
        generateName: 'hello-world-bfb8bb77-',
        namespace: 'test-app',
        uid: 'e656560a-8113-4578-946e-2407ad0530af',
        resourceVersion: '42257',
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'hello-world-bfb8bb77',
            uid: 'a69e8b1c-6721-44f6-97de-542fd2892419',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-7g8nf',
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
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-7g8nf',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
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
            lastTransitionTime: '2023-02-15T09:00:37Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:43Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:43Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-02-15T09:00:36Z',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.32',
        podIPs: [
          {
            ip: '10.244.0.32',
          },
        ],
        startTime: '2023-02-15T09:00:37Z',
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: '2023-02-15T09:00:43Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://28d5d65bdf20591f9386567917d0881d96bd467e4269d988ea3d473d3d40470f',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world-45-bfb8bb77-z89wc',
        generateName: 'hello-world-45-bfb8bb77-',
        namespace: 'test-app',
        uid: '649ccf32-0cb5-4d75-9cd2-cb0079edd4f9',
        resourceVersion: '491057',
        creationTimestamp: '2023-03-08T07:32:27Z',
        labels: {
          app: 'hello-world-45',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'hello-world-45-bfb8bb77',
            uid: 'cdae3fc6-67ae-4af0-97f6-7590f517a91b',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-xgcgh',
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
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'container',
            image: 'openshift/hello-openshift',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-xgcgh',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'minikube',
        securityContext: {},
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
            lastTransitionTime: '2023-03-08T07:32:27Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:31Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:31Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-08T07:32:27Z',
          },
        ],
        hostIP: '192.168.64.6',
        podIP: '10.244.0.97',
        podIPs: [
          {
            ip: '10.244.0.97',
          },
        ],
        startTime: '2023-03-08T07:32:27Z',
        containerStatuses: [
          {
            name: 'container',
            state: {
              running: {
                startedAt: '2023-03-08T07:32:30Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'openshift/hello-openshift:latest',
            imageID:
              'docker-pullable://openshift/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            containerID:
              'docker://02957da29b2f48df90210d1f96df8953b4c4ac438b9b7a00fb339042cf6fe70a',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
  ],
  replicaSets: [
    {
      kind: 'ReplicaSet',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world-bfb8bb77',
        namespace: 'test-app',
        uid: 'a69e8b1c-6721-44f6-97de-542fd2892419',
        resourceVersion: '42258',
        generation: 1,
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          app: 'name',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '1',
          'deployment.kubernetes.io/max-replicas': '2',
          'deployment.kubernetes.io/revision': '1',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: 'hello-world',
            uid: '17094219-d12e-431c-bb3f-ee0876f11b04',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'name',
            'pod-template-hash': 'bfb8bb77',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
              'pod-template-hash': 'bfb8bb77',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
      },
      status: {
        replicas: 1,
        fullyLabeledReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        observedGeneration: 1,
      },
    },
    {
      kind: 'ReplicaSet',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world-45-bfb8bb77',
        namespace: 'test-app',
        uid: 'cdae3fc6-67ae-4af0-97f6-7590f517a91b',
        resourceVersion: '491058',
        generation: 1,
        creationTimestamp: '2023-03-08T07:32:26Z',
        labels: {
          app: 'hello-world-45',
          'backstage.io/kubernetes-id': 'backstage',
          'pod-template-hash': 'bfb8bb77',
        },
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '1',
          'deployment.kubernetes.io/max-replicas': '2',
          'deployment.kubernetes.io/revision': '1',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: 'hello-world-45',
            uid: '58f0c8ba-492a-4460-9105-dabe475062dd',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'hello-world-45',
            'pod-template-hash': 'bfb8bb77',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'hello-world-45',
              'backstage.io/kubernetes-id': 'backstage',
              'pod-template-hash': 'bfb8bb77',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
      },
      status: {
        replicas: 1,
        fullyLabeledReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        observedGeneration: 1,
      },
    },
  ],
  deployments: [
    {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world',
        namespace: 'test-app',
        uid: '17094219-d12e-431c-bb3f-ee0876f11b04',
        resourceVersion: '42259',
        generation: 1,
        creationTimestamp: '2023-02-15T09:00:36Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'name',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'name',
              'backstage.io/kubernetes-id': 'backstage',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2023-02-15T09:00:43Z',
            lastTransitionTime: '2023-02-15T09:00:43Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2023-02-15T09:00:43Z',
            lastTransitionTime: '2023-02-15T09:00:36Z',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-world-bfb8bb77" has successfully progressed.',
          },
        ],
      },
    },
    {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: 'hello-world-45',
        namespace: 'test-app',
        uid: '58f0c8ba-492a-4460-9105-dabe475062dd',
        resourceVersion: '491059',
        generation: 1,
        creationTimestamp: '2023-03-08T07:32:26Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'hello-world-45',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'hello-world-45',
              'backstage.io/kubernetes-id': 'backstage',
            },
          },
          spec: {
            containers: [
              {
                name: 'container',
                image: 'openshift/hello-openshift',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2023-03-08T07:32:31Z',
            lastTransitionTime: '2023-03-08T07:32:31Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2023-03-08T07:32:31Z',
            lastTransitionTime: '2023-03-08T07:32:26Z',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-world-45-bfb8bb77" has successfully progressed.',
          },
        ],
      },
    },
  ],
  services: [
    {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        name: 'hello-world',
        namespace: 'test-app',
        uid: 'e5112e42-d7d5-476b-a2fd-ba10e722e2f1',
        resourceVersion: '325220',
        creationTimestamp: '2023-03-01T08:13:39Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
      },
      spec: {
        ports: [
          {
            protocol: 'TCP',
            port: 8080,
            targetPort: 8080,
            nodePort: 30497,
          },
        ],
        selector: {
          app: 'name',
        },
        clusterIP: '10.110.148.168',
        clusterIPs: ['10.110.148.168'],
        type: 'NodePort',
        sessionAffinity: 'None',
        externalTrafficPolicy: 'Cluster',
        ipFamilies: ['IPv4'],
        ipFamilyPolicy: 'SingleStack',
        internalTrafficPolicy: 'Cluster',
      },
      status: {
        loadBalancer: {},
      },
    },
  ],
  ingresses: [
    {
      kind: 'Ingress',
      apiVersion: 'networking.k8s.io/v1',
      metadata: {
        name: 'example-ingress-hello-world',
        namespace: 'test-app',
        uid: '72498002-509f-4a93-9924-4ffcdf3df5d5',
        resourceVersion: '325525',
        generation: 1,
        creationTimestamp: '2023-03-01T08:17:52Z',
        labels: {
          'backstage.io/kubernetes-id': 'backstage',
        },
        annotations: {
          'nginx.ingress.kubernetes.io/rewrite-target': '/$1',
        },
      },
      spec: {
        ingressClassName: 'nginx',
        rules: [
          {
            host: 'hello-world-app.info',
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'hello-world',
                      port: {
                        number: 8080,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      status: {
        loadBalancer: {
          ingress: [
            {
              ip: '192.168.64.6',
            },
          ],
        },
      },
    },
  ],
};

export const mockK8sResourcesData = {
  loading: false,
  error: '',
  watchResourcesData: {
    deployments: {
      data: mockKubernetesResponse.deployments,
    },
    pods: {
      data: mockKubernetesResponse.pods,
    },
    replicaSets: {
      data: mockKubernetesResponse.replicaSets,
    },
    services: {
      data: mockKubernetesResponse.services,
    },
    ingresses: {
      data: mockKubernetesResponse.ingresses,
    },
  },
};
