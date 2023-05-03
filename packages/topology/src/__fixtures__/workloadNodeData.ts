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
              creationTimestamp: '2023-02-13T15:00:22Z',
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
    },
  },
  width: 104,
  height: 104,
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
