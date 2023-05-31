import { mockPipeline, mockPipelineRun } from './tektonResources';

export const workloadNodeData = {
  data: {
    resource: {
      metadata: {
        name: 'hello-minikube2',
        namespace: 'div',
        uid: 'bfb6932f-64c6-4fe3-b283-16ecec8628c0',
        resourceVersion: '417930',
        generation: 6,
        creationTimestamp: '2023-02-13T14:49:49Z',
        ownerReferences: [{ name: 'app' }],
        labels: {
          app: 'hello-minikube2',
          'app.kubernetes.io/part-of': 'nationalparks-py',
          'backstage.io/kubernetes-id': 'nationalparks-py',
        },
        annotations: {
          'app.openshift.io/connects-to': 'hello-minikube3',
          'deployment.kubernetes.io/revision': '2',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'hello-minikube2',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'hello-minikube2',
              'backstage.io/kubernetes-id': 'nationalparks-py',
            },
          },
          spec: {
            containers: [
              {
                name: 'echo-server',
                image: 'kicbase/echo-server:1.0',
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'IfNotPresent',
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
        observedGeneration: 6,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2023-03-23T13:14:51Z',
            lastTransitionTime: '2023-02-13T14:49:49Z',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-minikube2-848cf77669" has successfully progressed.',
          },
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2023-04-07T15:03:02Z',
            lastTransitionTime: '2023-04-07T15:03:02Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
        ],
      },
      kind: 'Deployment',
      apiVersion: 'apps/v1',
    },
    data: {
      kind: 'Deployment',
      builderImage: 'default image',
      url: 'http://div/minikube',
      podsData: {
        obj: {
          metadata: {
            name: 'hello-minikube2',
            namespace: 'div',
            uid: 'bfb6932f-64c6-4fe3-b283-16ecec8628c0',
            resourceVersion: '417930',
            generation: 6,
            creationTimestamp: '2023-02-13T14:49:49Z',
            labels: {
              app: 'hello-minikube2',
              'app.kubernetes.io/part-of': 'nationalparks-py',
              'backstage.io/kubernetes-id': 'nationalparks-py',
            },
            annotations: {
              'app.openshift.io/connects-to': 'hello-minikube3',
              'deployment.kubernetes.io/revision': '2',
            },
          },
          spec: {
            replicas: 1,
            selector: {
              matchLabels: {
                app: 'hello-minikube2',
              },
            },
            template: {
              metadata: {
                creationTimestamp: null,
                labels: {
                  app: 'hello-minikube2',
                  'backstage.io/kubernetes-id': 'nationalparks-py',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'echo-server',
                    image: 'kicbase/echo-server:1.0',
                    resources: {},
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'IfNotPresent',
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
            observedGeneration: 6,
            replicas: 1,
            updatedReplicas: 1,
            readyReplicas: 1,
            availableReplicas: 1,
            conditions: [
              {
                type: 'Progressing',
                status: 'True',
                lastUpdateTime: '2023-03-23T13:14:51Z',
                lastTransitionTime: '2023-02-13T14:49:49Z',
                reason: 'NewReplicaSetAvailable',
                message:
                  'ReplicaSet "hello-minikube2-848cf77669" has successfully progressed.',
              },
              {
                type: 'Available',
                status: 'True',
                lastUpdateTime: '2023-04-07T15:03:02Z',
                lastTransitionTime: '2023-04-07T15:03:02Z',
                reason: 'MinimumReplicasAvailable',
                message: 'Deployment has minimum availability.',
              },
            ],
          },
          kind: 'Deployment',
          apiVersion: 'apps/v1',
        },
        current: {
          alerts: {},
          obj: {
            metadata: {
              name: 'hello-minikube2-848cf77669',
              namespace: 'div',
              uid: '06d5c182-5135-4676-9ceb-6b5cc52b9519',
              resourceVersion: '417928',
              generation: 3,
              creationTimestamp: '2023-03-23T13:14:49Z',
              labels: {
                app: 'hello-minikube2',
                'backstage.io/kubernetes-id': 'nationalparks-py',
                'pod-template-hash': '848cf77669',
              },
              annotations: {
                'app.openshift.io/connects-to': 'hello-minikube3',
                'deployment.kubernetes.io/desired-replicas': '4',
                'deployment.kubernetes.io/max-replicas': '5',
                'deployment.kubernetes.io/revision': '2',
              },
              ownerReferences: [
                {
                  apiVersion: 'apps/v1',
                  kind: 'Deployment',
                  name: 'hello-minikube2',
                  uid: 'bfb6932f-64c6-4fe3-b283-16ecec8628c0',
                  controller: true,
                  blockOwnerDeletion: true,
                },
              ],
            },
            spec: {
              replicas: 1,
              selector: {
                matchLabels: {
                  app: 'hello-minikube2',
                  'pod-template-hash': '848cf77669',
                },
              },
              template: {
                metadata: {
                  creationTimestamp: null,
                  labels: {
                    app: 'hello-minikube2',
                    'backstage.io/kubernetes-id': 'nationalparks-py',
                    'pod-template-hash': '848cf77669',
                  },
                },
                spec: {
                  containers: [
                    {
                      name: 'echo-server',
                      image: 'kicbase/echo-server:1.0',
                      resources: {},
                      terminationMessagePath: '/dev/termination-log',
                      terminationMessagePolicy: 'File',
                      imagePullPolicy: 'IfNotPresent',
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
              observedGeneration: 3,
            },
            kind: 'ReplicaSet',
            apiVersion: 'apps/v1',
          },
          pods: [
            {
              metadata: {
                name: 'hello-minikube2-848cf77669-5fqtp',
                generateName: 'hello-minikube2-848cf77669-',
                namespace: 'div',
                uid: 'ef2848f6-bdfd-4ae4-bba7-fac8d93e8dc5',
                resourceVersion: '417920',
                creationTimestamp: '2023-03-23T13:14:50Z',
                labels: {
                  app: 'hello-minikube2',
                  'backstage.io/kubernetes-id': 'nationalparks-py',
                  'pod-template-hash': '848cf77669',
                },
                ownerReferences: [
                  {
                    apiVersion: 'apps/v1',
                    kind: 'ReplicaSet',
                    name: 'hello-minikube2-848cf77669',
                    uid: '06d5c182-5135-4676-9ceb-6b5cc52b9519',
                    controller: true,
                    blockOwnerDeletion: true,
                  },
                ],
              },
              spec: {
                volumes: [
                  {
                    name: 'kube-api-access-lb9mh',
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
                    name: 'echo-server',
                    image: 'kicbase/echo-server:1.0',
                    resources: {},
                    volumeMounts: [
                      {
                        name: 'kube-api-access-lb9mh',
                        readOnly: true,
                        mountPath:
                          '/var/run/secrets/kubernetes.io/serviceaccount',
                      },
                    ],
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'IfNotPresent',
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
                    lastTransitionTime: '2023-03-23T13:14:50Z',
                  },
                  {
                    type: 'Ready',
                    status: 'True',
                    lastProbeTime: null,
                    lastTransitionTime: '2023-03-23T13:14:51Z',
                  },
                  {
                    type: 'ContainersReady',
                    status: 'True',
                    lastProbeTime: null,
                    lastTransitionTime: '2023-03-23T13:14:51Z',
                  },
                  {
                    type: 'PodScheduled',
                    status: 'True',
                    lastProbeTime: null,
                    lastTransitionTime: '2023-03-23T13:14:50Z',
                  },
                ],
                hostIP: '192.168.49.2',
                podIP: '10.244.0.23',
                podIPs: [
                  {
                    ip: '10.244.0.23',
                  },
                ],
                startTime: '2023-03-23T13:14:50Z',
                containerStatuses: [
                  {
                    name: 'echo-server',
                    state: {
                      running: {
                        startedAt: '2023-03-23T13:14:51Z',
                      },
                    },
                    lastState: {},
                    ready: true,
                    restartCount: 0,
                    image: 'kicbase/echo-server:1.0',
                    imageID:
                      'docker-pullable://kicbase/echo-server@sha256:127ac38a2bb9537b7f252addff209ea6801edcac8a92c8b1104dacd66a583ed6',
                    containerID:
                      'docker://44fa417ec9454b56491eb143d5914c12712f48732282f26eb224029f1a013cf6',
                    started: true,
                  },
                ],
                qosClass: 'BestEffort',
              },
              kind: 'Pod',
              apiVersion: 'v1',
            },
          ],
          revision: 2,
        },
        isRollingOut: false,
        pods: [
          {
            metadata: {
              name: 'hello-minikube2-848cf77669-5fqtp',
              generateName: 'hello-minikube2-848cf77669-',
              namespace: 'div',
              uid: 'ef2848f6-bdfd-4ae4-bba7-fac8d93e8dc5',
              resourceVersion: '417920',
              creationTimestamp: '2023-03-23T13:14:50Z',
              labels: {
                app: 'hello-minikube2',
                'backstage.io/kubernetes-id': 'nationalparks-py',
                'pod-template-hash': '848cf77669',
              },
              ownerReferences: [
                {
                  apiVersion: 'apps/v1',
                  kind: 'ReplicaSet',
                  name: 'hello-minikube2-848cf77669',
                  uid: '06d5c182-5135-4676-9ceb-6b5cc52b9519',
                  controller: true,
                  blockOwnerDeletion: true,
                },
              ],
            },
            spec: {
              volumes: [
                {
                  name: 'kube-api-access-lb9mh',
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
                  name: 'echo-server',
                  image: 'kicbase/echo-server:1.0',
                  resources: {},
                  volumeMounts: [
                    {
                      name: 'kube-api-access-lb9mh',
                      readOnly: true,
                      mountPath:
                        '/var/run/secrets/kubernetes.io/serviceaccount',
                    },
                  ],
                  terminationMessagePath: '/dev/termination-log',
                  terminationMessagePolicy: 'File',
                  imagePullPolicy: 'IfNotPresent',
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
                  lastTransitionTime: '2023-03-23T13:14:50Z',
                },
                {
                  type: 'Ready',
                  status: 'True',
                  lastProbeTime: null,
                  lastTransitionTime: '2023-03-23T13:14:51Z',
                },
                {
                  type: 'ContainersReady',
                  status: 'True',
                  lastProbeTime: null,
                  lastTransitionTime: '2023-03-23T13:14:51Z',
                },
                {
                  type: 'PodScheduled',
                  status: 'True',
                  lastProbeTime: null,
                  lastTransitionTime: '2023-03-23T13:14:50Z',
                },
              ],
              hostIP: '192.168.49.2',
              podIP: '10.244.0.23',
              podIPs: [
                {
                  ip: '10.244.0.23',
                },
              ],
              startTime: '2023-03-23T13:14:50Z',
              containerStatuses: [
                {
                  name: 'echo-server',
                  state: {
                    running: {
                      startedAt: '2023-03-23T13:14:51Z',
                    },
                  },
                  lastState: {},
                  ready: true,
                  restartCount: 0,
                  image: 'kicbase/echo-server:1.0',
                  imageID:
                    'docker-pullable://kicbase/echo-server@sha256:127ac38a2bb9537b7f252addff209ea6801edcac8a92c8b1104dacd66a583ed6',
                  containerID:
                    'docker://44fa417ec9454b56491eb143d5914c12712f48732282f26eb224029f1a013cf6',
                  started: true,
                },
              ],
              qosClass: 'BestEffort',
            },
            kind: 'Pod',
            apiVersion: 'v1',
          },
        ],
      },
      services: [
        {
          metadata: {
            name: 'hello-minikube2',
            namespace: 'div',
            uid: '465a9db1-b30c-4636-949b-c9bc9a000f56',
            resourceVersion: '3825',
            creationTimestamp: '2023-02-13T14:52:24Z',
            labels: {
              app: 'hello-minikube2',
              'backstage.io/kubernetes-id': 'nationalparks-py',
            },
          },
          spec: {
            ports: [
              {
                protocol: 'TCP',
                port: 8081,
                targetPort: 8081,
                nodePort: 30179,
              },
            ],
            selector: {
              app: 'hello-minikube2',
            },
            clusterIP: '10.101.77.157',
            clusterIPs: ['10.101.77.157'],
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
          kind: 'Service',
          apiVersion: 'v1',
        },
      ],
      ingressesData: [
        {
          ingress: {
            metadata: {
              name: 'hello-minikube2-ingress',
              namespace: 'div',
              uid: 'a2ea87d9-6ab5-4c4c-883f-cb8eb0d6f272',
              resourceVersion: '345759',
              generation: 2,
              creationTimestamp: new Date('2023-02-13T15:00:22Z'),
              labels: {
                'backstage.io/kubernetes-id': 'nationalparks-py',
              },
              annotations: {
                'kubectl.kubernetes.io/last-applied-configuration':
                  '{"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"annotations":{},"name":"hello-minikube2-ingress","namespace":"div"},"spec":{"rules":[{"http":{"paths":[{"backend":{"service":{"name":"hello-minikube2","port":{"number":8081}}},"path":"/minikube","pathType":"Prefix"}]}}]}}\n',
              },
            },
            spec: {
              rules: [
                {
                  host: 'div',
                  http: {
                    paths: [
                      {
                        path: '/minikube',
                        pathType: 'Prefix',
                        backend: {
                          service: {
                            name: 'hello-minikube2',
                            port: {
                              number: 8081,
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
              loadBalancer: {},
            },
            kind: 'Ingress',
            apiVersion: 'networking.k8s.io/v1',
          },
          url: 'http://div/minikube',
        },
      ],
      routesData: [
        {
          route: {
            metadata: {
              name: 'hello-minikube2',
              namespace: 'jai-test',
              uid: '17c0f520-3878-4834-96a1-b19854f0d06f',
              resourceVersion: '174049',
              creationTimestamp: '2023-05-22T08:14:25Z',
              labels: {
                app: 'hello-minikube2',
                'app.kubernetes.io/component': 'hello-minikube2',
                'app.kubernetes.io/instance': 'hello-minikube2',
                'app.kubernetes.io/name': 'hello-minikube2',
                'app.openshift.io/runtime': 'nodejs',
                'app.openshift.io/runtime-version': '16-ubi8',
                'backstage.io/kubernetes-id': 'backstage',
              },
              annotations: {
                'openshift.io/host.generated': 'true',
              },
            },
            spec: {
              host: 'nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
              to: {
                kind: 'Service',
                name: 'hello-minikube2',
                weight: 100,
              },
              port: {
                targetPort: '8080-tcp',
              },
              tls: {
                termination: 'edge',
                insecureEdgeTerminationPolicy: 'Redirect',
              },
              wildcardPolicy: 'None',
            },
            status: {
              ingress: [
                {
                  host: 'nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
                  routerName: 'default',
                  conditions: [
                    {
                      type: 'Admitted',
                      status: 'True',
                      lastTransitionTime: '2023-05-22T08:14:25Z',
                    },
                  ],
                  wildcardPolicy: 'None',
                  routerCanonicalHostname:
                    'router-default.apps.viraj-22-05-2023-0.devcluster.openshift.com',
                },
              ],
            },
            kind: 'Route',
          },
          url: 'https://nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
        },
      ],
    },
  },
  width: 104,
  height: 104,
};

export const cronJobWorkloadNodeData = {
  data: {
    resource: {
      metadata: {
        name: 'example-cj',
        namespace: 'div',
        uid: '9afc9c71-3870-4185-9725-ffe16b574575',
        resourceVersion: '378313',
        generation: 1,
        creationTimestamp: '2023-05-23T11:20:26Z',
        labels: {
          'backstage.io/kubernetes-id': 'nationalparks-py',
        },
      },
      spec: {
        schedule: '* * * * *',
        concurrencyPolicy: 'Allow',
        suspend: false,
        jobTemplate: {
          metadata: {
            creationTimestamp: null,
          },
          spec: {
            template: {
              metadata: {
                creationTimestamp: null,
                labels: {
                  'backstage.io/kubernetes-id': 'nationalparks-py',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'hello',
                    image: 'busybox',
                    args: [
                      '/bin/sh',
                      '-c',
                      'date; echo Hello from the Kubernetes cluster',
                    ],
                    resources: {},
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'Always',
                  },
                ],
                restartPolicy: 'OnFailure',
                terminationGracePeriodSeconds: 30,
                dnsPolicy: 'ClusterFirst',
                securityContext: {},
                schedulerName: 'default-scheduler',
              },
            },
          },
        },
        successfulJobsHistoryLimit: 3,
        failedJobsHistoryLimit: 1,
      },
      status: {
        lastScheduleTime: '2023-05-23T11:23:00Z',
        lastSuccessfulTime: '2023-05-23T11:23:06Z',
      },
      kind: 'CronJob',
      apiVersion: 'batch/v1',
    },
    data: {
      jobsData: [
        {
          job: {
            metadata: {
              name: 'example-cj-28080681',
              namespace: 'div',
              uid: 'a758623e-6ddd-4858-acd8-efa18b336c25',
              resourceVersion: '376354',
              generation: 1,
              creationTimestamp: '2023-05-23T11:21:00Z',
              labels: {
                'backstage.io/kubernetes-id': 'nationalparks-py',
                'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                'job-name': 'example-cj-28080681',
              },
              annotations: {
                'batch.kubernetes.io/job-tracking': '',
              },
              ownerReferences: [
                {
                  apiVersion: 'batch/v1',
                  kind: 'CronJob',
                  name: 'example-cj',
                  uid: '9afc9c71-3870-4185-9725-ffe16b574575',
                  controller: true,
                  blockOwnerDeletion: true,
                },
              ],
            },
            spec: {
              parallelism: 1,
              completions: 1,
              backoffLimit: 6,
              selector: {
                matchLabels: {
                  'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                },
              },
              template: {
                metadata: {
                  creationTimestamp: null,
                  labels: {
                    'backstage.io/kubernetes-id': 'nationalparks-py',
                    'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                    'job-name': 'example-cj-28080681',
                  },
                },
                spec: {
                  containers: [
                    {
                      name: 'hello',
                      image: 'busybox',
                      args: [
                        '/bin/sh',
                        '-c',
                        'date; echo Hello from the Kubernetes cluster',
                      ],
                      resources: {},
                      terminationMessagePath: '/dev/termination-log',
                      terminationMessagePolicy: 'File',
                      imagePullPolicy: 'Always',
                    },
                  ],
                  restartPolicy: 'OnFailure',
                  terminationGracePeriodSeconds: 30,
                  dnsPolicy: 'ClusterFirst',
                  securityContext: {},
                  schedulerName: 'default-scheduler',
                },
              },
              completionMode: 'NonIndexed',
              suspend: false,
            },
            status: {
              conditions: [
                {
                  type: 'Complete',
                  status: 'True',
                  lastProbeTime: '2023-05-23T11:21:09Z',
                  lastTransitionTime: '2023-05-23T11:21:09Z',
                },
              ],
              startTime: '2023-05-23T11:21:00Z',
              completionTime: '2023-05-23T11:21:09Z',
              succeeded: 1,
              uncountedTerminatedPods: {},
              ready: 0,
            },
            kind: 'Job',
            apiVersion: 'batch/v1',
          },
          podsData: {
            pods: [
              {
                metadata: {
                  name: 'example-cj-28080681-clstf',
                  generateName: 'example-cj-28080681-',
                  namespace: 'div',
                  uid: '63fa5640-9a7e-4d85-8ab0-a83d1b11c925',
                  resourceVersion: '376353',
                  creationTimestamp: '2023-05-23T11:21:00Z',
                  labels: {
                    'backstage.io/kubernetes-id': 'nationalparks-py',
                    'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                    'job-name': 'example-cj-28080681',
                  },
                  annotations: {
                    'k8s.ovn.org/pod-networks':
                      '{"default":{"ip_addresses":["10.129.2.93/23"],"mac_address":"0a:58:0a:81:02:5d","gateway_ips":["10.129.2.1"],"ip_address":"10.129.2.93/23","gateway_ip":"10.129.2.1"}}',
                    'k8s.v1.cni.cncf.io/network-status':
                      '[{\n    "name": "ovn-kubernetes",\n    "interface": "eth0",\n    "ips": [\n        "10.129.2.93"\n    ],\n    "mac": "0a:58:0a:81:02:5d",\n    "default": true,\n    "dns": {}\n}]',
                    'openshift.io/scc': 'restricted-v2',
                    'seccomp.security.alpha.kubernetes.io/pod':
                      'runtime/default',
                  },
                  ownerReferences: [
                    {
                      apiVersion: 'batch/v1',
                      kind: 'Job',
                      name: 'example-cj-28080681',
                      uid: 'a758623e-6ddd-4858-acd8-efa18b336c25',
                      controller: true,
                      blockOwnerDeletion: true,
                    },
                  ],
                },
                spec: {
                  volumes: [
                    {
                      name: 'kube-api-access-rzlcq',
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
                      name: 'hello',
                      image: 'busybox',
                      args: [
                        '/bin/sh',
                        '-c',
                        'date; echo Hello from the Kubernetes cluster',
                      ],
                      resources: {},
                      volumeMounts: [
                        {
                          name: 'kube-api-access-rzlcq',
                          readOnly: true,
                          mountPath:
                            '/var/run/secrets/kubernetes.io/serviceaccount',
                        },
                      ],
                      terminationMessagePath: '/dev/termination-log',
                      terminationMessagePolicy: 'File',
                      imagePullPolicy: 'Always',
                      securityContext: {
                        capabilities: {
                          drop: ['ALL'],
                        },
                        runAsUser: 1000850000,
                        runAsNonRoot: true,
                        allowPrivilegeEscalation: false,
                      },
                    },
                  ],
                  restartPolicy: 'OnFailure',
                  terminationGracePeriodSeconds: 30,
                  dnsPolicy: 'ClusterFirst',
                  serviceAccountName: 'default',
                  serviceAccount: 'default',
                  nodeName: 'ip-10-0-142-122.sa-east-1.compute.internal',
                  securityContext: {
                    seLinuxOptions: {
                      level: 's0:c29,c19',
                    },
                    fsGroup: 1000850000,
                    seccompProfile: {
                      type: 'RuntimeDefault',
                    },
                  },
                  imagePullSecrets: [
                    {
                      name: 'default-dockercfg-ngnwr',
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
                  phase: 'Succeeded',
                  conditions: [
                    {
                      type: 'Initialized',
                      status: 'True',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                      reason: 'PodCompleted',
                    },
                    {
                      type: 'Ready',
                      status: 'False',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                      reason: 'PodCompleted',
                    },
                    {
                      type: 'ContainersReady',
                      status: 'False',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                      reason: 'PodCompleted',
                    },
                    {
                      type: 'PodScheduled',
                      status: 'True',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                    },
                  ],
                  hostIP: '10.0.142.122',
                  podIP: '10.129.2.93',
                  podIPs: [
                    {
                      ip: '10.129.2.93',
                    },
                  ],
                  startTime: '2023-05-23T11:21:00Z',
                  containerStatuses: [
                    {
                      name: 'hello',
                      state: {
                        terminated: {
                          exitCode: 0,
                          reason: 'Completed',
                          startedAt: '2023-05-23T11:21:05Z',
                          finishedAt: '2023-05-23T11:21:05Z',
                          containerID:
                            'cri-o://db5fc2a895837eaa71cf4fdfc23602f9e5190140b9a7b6d30b6b8d781e99c53e',
                        },
                      },
                      lastState: {},
                      ready: false,
                      restartCount: 0,
                      image: 'docker.io/library/busybox:latest',
                      imageID:
                        'docker.io/library/busybox@sha256:560af6915bfc8d7630e50e212e08242d37b63bd5c1ccf9bd4acccf116e262d5b',
                      containerID:
                        'cri-o://db5fc2a895837eaa71cf4fdfc23602f9e5190140b9a7b6d30b6b8d781e99c53e',
                      started: false,
                    },
                  ],
                  qosClass: 'BestEffort',
                },
                kind: 'Pod',
                apiVersion: 'v1',
              },
            ],
          },
        },
      ],
    },
  },
  width: 104,
  height: 104,
};

export const tektonWorkloadNodeData = {
  ...workloadNodeData,
  data: {
    ...workloadNodeData.data,
    data: {
      ...workloadNodeData.data.data,
      pipelinesData: {
        pipelines: [mockPipeline],
        pipelineRuns: [mockPipelineRun],
      },
    },
  },
};

export const workloadNode = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => workloadNodeData.data,
};

export const workloadNode2 = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => ({ resource: {}, data: {} }),
};

export const workloadNode3 = {
  getDimensions: () => ({
    width: cronJobWorkloadNodeData.width,
    height: cronJobWorkloadNodeData.height,
  }),
  getData: () => cronJobWorkloadNodeData.data,
};

export const workloadNode4 = {
  getDimensions: () => ({
    width: cronJobWorkloadNodeData.width,
    height: cronJobWorkloadNodeData.height,
  }),
  getData: () => ({
    resource: cronJobWorkloadNodeData.data.resource,
    data: {},
  }),
};

export const workloadNodeWtknRes = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => tektonWorkloadNodeData.data,
};
