export const mockDeploymentData = {
  kind: 'Deployment',
  apiVersion: 'apps/v1',
  metadata: {
    annotations: {
      'alpha.image.policy.openshift.io/resolve-names': '*',
      'app.openshift.io/route-disabled': 'false',
      'deployment.kubernetes.io/revision': '1',
      'image.openshift.io/triggers':
        '[{"from":{"kind":"ImageStreamTag","name":"hello-openshift:latest","namespace":"jai-test"},"fieldPath":"spec.template.spec.containers[?(@.name==\\"hello-openshift\\")].image","pause":"false"}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
    },
    resourceVersion: '342643',
    name: 'hello-openshift',
    uid: 'dede72be-c7c7-4c40-85d0-03e051f90a96',
    creationTimestamp: '2023-01-31T11:32:36Z',
    generation: 1,
    managedFields: [
      {
        manager: 'Mozilla',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-01-31T11:32:36Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:alpha.image.policy.openshift.io/resolve-names': {},
              'f:app.openshift.io/route-disabled': {},
              'f:image.openshift.io/triggers': {},
              'f:openshift.io/generated-by': {},
            },
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:app.kubernetes.io/component': {},
              'f:app.kubernetes.io/instance': {},
              'f:app.kubernetes.io/name': {},
              'f:app.openshift.io/runtime-namespace': {},
            },
          },
          'f:spec': {
            'f:progressDeadlineSeconds': {},
            'f:replicas': {},
            'f:revisionHistoryLimit': {},
            'f:selector': {},
            'f:strategy': {
              'f:rollingUpdate': {
                '.': {},
                'f:maxSurge': {},
                'f:maxUnavailable': {},
              },
              'f:type': {},
            },
            'f:template': {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:openshift.io/generated-by': {},
                },
                'f:labels': {
                  '.': {},
                  'f:app': {},
                  'f:deployment': {},
                },
              },
              'f:spec': {
                'f:containers': {
                  'k:{"name":"hello-openshift"}': {
                    '.': {},
                    'f:image': {},
                    'f:imagePullPolicy': {},
                    'f:name': {},
                    'f:ports': {
                      '.': {},
                      'k:{"containerPort":8080,"protocol":"TCP"}': {
                        '.': {},
                        'f:containerPort': {},
                        'f:protocol': {},
                      },
                      'k:{"containerPort":8888,"protocol":"TCP"}': {
                        '.': {},
                        'f:containerPort': {},
                        'f:protocol': {},
                      },
                    },
                    'f:resources': {},
                    'f:terminationMessagePath': {},
                    'f:terminationMessagePolicy': {},
                  },
                },
                'f:dnsPolicy': {},
                'f:restartPolicy': {},
                'f:schedulerName': {},
                'f:securityContext': {},
                'f:terminationGracePeriodSeconds': {},
              },
            },
          },
        },
      },
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-01-31T11:32:40Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              'f:deployment.kubernetes.io/revision': {},
            },
          },
          'f:status': {
            'f:availableReplicas': {},
            'f:conditions': {
              '.': {},
              'k:{"type":"Available"}': {
                '.': {},
                'f:lastTransitionTime': {},
                'f:lastUpdateTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Progressing"}': {
                '.': {},
                'f:lastTransitionTime': {},
                'f:lastUpdateTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
            },
            'f:observedGeneration': {},
            'f:readyReplicas': {},
            'f:replicas': {},
            'f:updatedReplicas': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    labels: {
      app: 'hello-openshift',
      'app.kubernetes.io/component': 'hello-openshift',
      'app.kubernetes.io/instance': 'hello-openshift',
      'app.kubernetes.io/name': 'hello-openshift',
      'app.openshift.io/runtime-namespace': 'jai-test',
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: 'hello-openshift',
      },
    },
    template: {
      metadata: {
        creationTimestamp: null,
        labels: {
          app: 'hello-openshift',
          deployment: 'hello-openshift',
        },
        annotations: {
          'openshift.io/generated-by': 'OpenShiftWebConsole',
        },
      },
      spec: {
        containers: [
          {
            name: 'hello-openshift',
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
              {
                containerPort: 8888,
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
        lastUpdateTime: '2023-01-31T11:32:40Z',
        lastTransitionTime: '2023-01-31T11:32:40Z',
        reason: 'MinimumReplicasAvailable',
        message: 'Deployment has minimum availability.',
      },
      {
        type: 'Progressing',
        status: 'True',
        lastUpdateTime: '2023-01-31T11:32:40Z',
        lastTransitionTime: '2023-01-31T11:32:36Z',
        reason: 'NewReplicaSetAvailable',
        message:
          'ReplicaSet "hello-openshift-5957b95fdb" has successfully progressed.',
      },
    ],
  },
};

export const mockPodData = {
  kind: 'Pod',
  apiVersion: 'v1',
  metadata: {
    generateName: 'hello-openshift-5957b95fdb-',
    annotations: {
      'k8s.v1.cni.cncf.io/network-status':
        '[{\n    "name": "openshift-sdn",\n    "interface": "eth0",\n    "ips": [\n        "10.130.0.109"\n    ],\n    "default": true,\n    "dns": {}\n}]',
      'k8s.v1.cni.cncf.io/networks-status':
        '[{\n    "name": "openshift-sdn",\n    "interface": "eth0",\n    "ips": [\n        "10.130.0.109"\n    ],\n    "default": true,\n    "dns": {}\n}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
      'openshift.io/scc': 'restricted-v2',
      'seccomp.security.alpha.kubernetes.io/pod': 'runtime/default',
    },
    resourceVersion: '342639',
    name: 'hello-openshift-5957b95fdb-p95jh',
    uid: 'd7e3e562-1967-4d09-af04-395a5708cc38',
    creationTimestamp: '2023-01-31T11:32:36Z',
    managedFields: [
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-01-31T11:32:36Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:openshift.io/generated-by': {},
            },
            'f:generateName': {},
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:deployment': {},
              'f:pod-template-hash': {},
            },
            'f:ownerReferences': {
              '.': {},
              'k:{"uid":"80ad68b5-e209-45e7-965d-305fd315e635"}': {},
            },
          },
          'f:spec': {
            'f:containers': {
              'k:{"name":"hello-openshift"}': {
                '.': {},
                'f:image': {},
                'f:imagePullPolicy': {},
                'f:name': {},
                'f:ports': {
                  '.': {},
                  'k:{"containerPort":8080,"protocol":"TCP"}': {
                    '.': {},
                    'f:containerPort': {},
                    'f:protocol': {},
                  },
                  'k:{"containerPort":8888,"protocol":"TCP"}': {
                    '.': {},
                    'f:containerPort': {},
                    'f:protocol': {},
                  },
                },
                'f:resources': {},
                'f:terminationMessagePath': {},
                'f:terminationMessagePolicy': {},
              },
            },
            'f:dnsPolicy': {},
            'f:enableServiceLinks': {},
            'f:restartPolicy': {},
            'f:schedulerName': {},
            'f:securityContext': {},
            'f:terminationGracePeriodSeconds': {},
          },
        },
      },
      {
        manager: 'multus',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-01-31T11:32:38Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              'f:k8s.v1.cni.cncf.io/network-status': {},
              'f:k8s.v1.cni.cncf.io/networks-status': {},
            },
          },
        },
        subresource: 'status',
      },
      {
        manager: 'kubelet',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-01-31T11:32:40Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:status': {
            'f:conditions': {
              'k:{"type":"ContainersReady"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Initialized"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Ready"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
            },
            'f:containerStatuses': {},
            'f:hostIP': {},
            'f:phase': {},
            'f:podIP': {},
            'f:podIPs': {
              '.': {},
              'k:{"ip":"10.130.0.109"}': {
                '.': {},
                'f:ip': {},
              },
            },
            'f:startTime': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    ownerReferences: [
      {
        apiVersion: 'apps/v1',
        kind: 'ReplicaSet',
        name: 'hello-openshift-5957b95fdb',
        uid: '80ad68b5-e209-45e7-965d-305fd315e635',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
    labels: {
      app: 'hello-openshift',
      deployment: 'hello-openshift',
      'pod-template-hash': '5957b95fdb',
    },
  },
  spec: {
    restartPolicy: 'Always',
    serviceAccountName: 'default',
    imagePullSecrets: [
      {
        name: 'default-dockercfg-29blf',
      },
    ],
    priority: 0,
    schedulerName: 'default-scheduler',
    enableServiceLinks: true,
    terminationGracePeriodSeconds: 30,
    preemptionPolicy: 'PreemptLowerPriority',
    nodeName: 'ip-10-0-187-226.us-east-2.compute.internal',
    securityContext: {
      seLinuxOptions: {
        level: 's0:c28,c22',
      },
      fsGroup: 1000800000,
      seccompProfile: {
        type: 'RuntimeDefault',
      },
    },
    containers: [
      {
        resources: {},
        terminationMessagePath: '/dev/termination-log',
        name: 'hello-openshift',
        securityContext: {
          capabilities: {
            drop: ['ALL'],
          },
          runAsUser: 1000800000,
          runAsNonRoot: true,
          allowPrivilegeEscalation: false,
        },
        ports: [
          {
            containerPort: 8080,
            protocol: 'TCP',
          },
          {
            containerPort: 8888,
            protocol: 'TCP',
          },
        ],
        imagePullPolicy: 'Always',
        volumeMounts: [
          {
            name: 'kube-api-access-tkh29',
            readOnly: true,
            mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
          },
        ],
        terminationMessagePolicy: 'File',
        image:
          'image-registry.openshift-image-registry.svc:5000/jai-test/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
      },
    ],
    serviceAccount: 'default',
    volumes: [
      {
        name: 'kube-api-access-tkh29',
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
    dnsPolicy: 'ClusterFirst',
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
  },
  status: {
    phase: 'Running',
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-01-31T11:32:36Z',
      },
      {
        type: 'Ready',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-01-31T11:32:40Z',
      },
      {
        type: 'ContainersReady',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-01-31T11:32:40Z',
      },
      {
        type: 'PodScheduled',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-01-31T11:32:36Z',
      },
    ],
    hostIP: '10.0.187.226',
    podIP: '10.130.0.109',
    podIPs: [
      {
        ip: '10.130.0.109',
      },
    ],
    startTime: '2023-01-31T11:32:36Z',
    containerStatuses: [
      {
        restartCount: 0,
        started: true,
        ready: true,
        name: 'hello-openshift',
        state: {
          running: {
            startedAt: '2023-01-31T11:32:40Z',
          },
        },
        imageID:
          'image-registry.openshift-image-registry.svc:5000/jai-test/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
        image:
          'image-registry.openshift-image-registry.svc:5000/jai-test/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
        lastState: {},
        containerID:
          'cri-o://00c14337204965d9b5058b598ae680d45c0c970ce007945ae289c12dc14788c8',
      },
    ],
    qosClass: 'BestEffort',
  },
};

export const mockReplicasetData = {
  kind: 'ReplicaSet',
  apiVersion: 'apps/v1',
  metadata: {
    annotations: {
      'alpha.image.policy.openshift.io/resolve-names': '*',
      'app.openshift.io/route-disabled': 'false',
      'deployment.kubernetes.io/desired-replicas': '1',
      'deployment.kubernetes.io/max-replicas': '2',
      'deployment.kubernetes.io/revision': '1',
      'image.openshift.io/triggers':
        '[{"from":{"kind":"ImageStreamTag","name":"hello-openshift:latest","namespace":"jai-test"},"fieldPath":"spec.template.spec.containers[?(@.name==\\"hello-openshift\\")].image","pause":"false"}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
    },
    resourceVersion: '342640',
    name: 'hello-openshift-5957b95fdb',
    uid: '80ad68b5-e209-45e7-965d-305fd315e635',
    creationTimestamp: '2023-01-31T11:32:36Z',
    generation: 1,
    managedFields: [
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-01-31T11:32:36Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:alpha.image.policy.openshift.io/resolve-names': {},
              'f:app.openshift.io/route-disabled': {},
              'f:deployment.kubernetes.io/desired-replicas': {},
              'f:deployment.kubernetes.io/max-replicas': {},
              'f:deployment.kubernetes.io/revision': {},
              'f:image.openshift.io/triggers': {},
              'f:openshift.io/generated-by': {},
            },
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:deployment': {},
              'f:pod-template-hash': {},
            },
            'f:ownerReferences': {
              '.': {},
              'k:{"uid":"dede72be-c7c7-4c40-85d0-03e051f90a96"}': {},
            },
          },
          'f:spec': {
            'f:replicas': {},
            'f:selector': {},
            'f:template': {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:openshift.io/generated-by': {},
                },
                'f:labels': {
                  '.': {},
                  'f:app': {},
                  'f:deployment': {},
                  'f:pod-template-hash': {},
                },
              },
              'f:spec': {
                'f:containers': {
                  'k:{"name":"hello-openshift"}': {
                    '.': {},
                    'f:image': {},
                    'f:imagePullPolicy': {},
                    'f:name': {},
                    'f:ports': {
                      '.': {},
                      'k:{"containerPort":8080,"protocol":"TCP"}': {
                        '.': {},
                        'f:containerPort': {},
                        'f:protocol': {},
                      },
                      'k:{"containerPort":8888,"protocol":"TCP"}': {
                        '.': {},
                        'f:containerPort': {},
                        'f:protocol': {},
                      },
                    },
                    'f:resources': {},
                    'f:terminationMessagePath': {},
                    'f:terminationMessagePolicy': {},
                  },
                },
                'f:dnsPolicy': {},
                'f:restartPolicy': {},
                'f:schedulerName': {},
                'f:securityContext': {},
                'f:terminationGracePeriodSeconds': {},
              },
            },
          },
        },
      },
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-01-31T11:32:40Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:status': {
            'f:availableReplicas': {},
            'f:fullyLabeledReplicas': {},
            'f:observedGeneration': {},
            'f:readyReplicas': {},
            'f:replicas': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    ownerReferences: [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: 'hello-openshift',
        uid: 'dede72be-c7c7-4c40-85d0-03e051f90a96',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
    labels: {
      app: 'hello-openshift',
      deployment: 'hello-openshift',
      'pod-template-hash': '5957b95fdb',
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: 'hello-openshift',
        'pod-template-hash': '5957b95fdb',
      },
    },
    template: {
      metadata: {
        creationTimestamp: null,
        labels: {
          app: 'hello-openshift',
          deployment: 'hello-openshift',
          'pod-template-hash': '5957b95fdb',
        },
        annotations: {
          'openshift.io/generated-by': 'OpenShiftWebConsole',
        },
      },
      spec: {
        containers: [
          {
            name: 'hello-openshift',
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/hello-openshift@sha256:aaea76ff622d2f8bcb32e538e7b3cd0ef6d291953f3e7c9f556c1ba5baf47e2e',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
              {
                containerPort: 8888,
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
};

export const mockDeploymentData2 = {
  kind: 'Deployment',
  apiVersion: 'apps/v1',
  metadata: {
    annotations: {
      'alpha.image.policy.openshift.io/resolve-names': '*',
      'app.openshift.io/route-disabled': 'false',
      'deployment.kubernetes.io/revision': '1',
      'image.openshift.io/triggers':
        '[{"from":{"kind":"ImageStreamTag","name":"helloworld:latest","namespace":"jai-test"},"fieldPath":"spec.template.spec.containers[?(@.name==\\"helloworld\\")].image","pause":"false"}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
      'app.openshift.io/connects-to':
        '[{"apiVersion":"apps/v1","kind":"Deployment","name":"hello-openshift"}]',
    },
    resourceVersion: '77853',
    name: 'helloworld',
    uid: '3d338bc2-6919-474c-926a-450f0ceed665',
    creationTimestamp: '2023-02-08T13:49:21Z',
    generation: 3,
    managedFields: [
      {
        manager: 'Mozilla',
        operation: 'Update',
        apiVersion: 'apps/v1',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:spec': {
            'f:replicas': {},
          },
        },
        subresource: 'scale',
      },
      {
        manager: 'Mozilla',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-02-08T13:49:21Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:alpha.image.policy.openshift.io/resolve-names': {},
              'f:app.openshift.io/route-disabled': {},
              'f:image.openshift.io/triggers': {},
              'f:openshift.io/generated-by': {},
            },
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:app.kubernetes.io/component': {},
              'f:app.kubernetes.io/instance': {},
              'f:app.kubernetes.io/name': {},
              'f:app.openshift.io/runtime-namespace': {},
            },
          },
          'f:spec': {
            'f:progressDeadlineSeconds': {},
            'f:revisionHistoryLimit': {},
            'f:selector': {},
            'f:strategy': {
              'f:rollingUpdate': {
                '.': {},
                'f:maxSurge': {},
                'f:maxUnavailable': {},
              },
              'f:type': {},
            },
            'f:template': {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:openshift.io/generated-by': {},
                },
                'f:labels': {
                  '.': {},
                  'f:app': {},
                  'f:deployment': {},
                },
              },
              'f:spec': {
                'f:containers': {
                  'k:{"name":"helloworld"}': {
                    '.': {},
                    'f:image': {},
                    'f:imagePullPolicy': {},
                    'f:name': {},
                    'f:ports': {
                      '.': {},
                      'k:{"containerPort":8080,"protocol":"TCP"}': {
                        '.': {},
                        'f:containerPort': {},
                        'f:protocol': {},
                      },
                    },
                    'f:resources': {},
                    'f:terminationMessagePath': {},
                    'f:terminationMessagePolicy': {},
                  },
                },
                'f:dnsPolicy': {},
                'f:restartPolicy': {},
                'f:schedulerName': {},
                'f:securityContext': {},
                'f:terminationGracePeriodSeconds': {},
              },
            },
          },
        },
      },
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-02-08T13:52:49Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              'f:deployment.kubernetes.io/revision': {},
            },
          },
          'f:status': {
            'f:availableReplicas': {},
            'f:conditions': {
              '.': {},
              'k:{"type":"Available"}': {
                '.': {},
                'f:lastTransitionTime': {},
                'f:lastUpdateTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Progressing"}': {
                '.': {},
                'f:lastTransitionTime': {},
                'f:lastUpdateTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"ReplicaFailure"}': {
                '.': {},
                'f:lastTransitionTime': {},
                'f:lastUpdateTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
            },
            'f:observedGeneration': {},
            'f:readyReplicas': {},
            'f:replicas': {},
            'f:unavailableReplicas': {},
            'f:updatedReplicas': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    labels: {
      app: 'helloworld',
      'app.kubernetes.io/component': 'helloworld',
      'app.kubernetes.io/instance': 'helloworld',
      'app.kubernetes.io/name': 'helloworld',
      'app.kubernetes.io/part-of': 'helloworld-app',
      'app.openshift.io/runtime-namespace': 'jai-test',
    },
  },
  spec: {
    replicas: 3,
    selector: {
      matchLabels: {
        app: 'helloworld',
      },
    },
    template: {
      metadata: {
        creationTimestamp: null,
        labels: {
          app: 'helloworld',
          deployment: 'helloworld',
        },
        annotations: {
          'openshift.io/generated-by': 'OpenShiftWebConsole',
        },
      },
      spec: {
        containers: [
          {
            name: 'helloworld',
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
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
    observedGeneration: 3,
    replicas: 2,
    updatedReplicas: 2,
    readyReplicas: 1,
    availableReplicas: 1,
    unavailableReplicas: 2,
    conditions: [
      {
        type: 'Progressing',
        status: 'True',
        lastUpdateTime: '2023-02-08T13:49:26Z',
        lastTransitionTime: '2023-02-08T13:49:21Z',
        reason: 'NewReplicaSetAvailable',
        message:
          'ReplicaSet "helloworld-5544d9965d" has successfully progressed.',
      },
      {
        type: 'Available',
        status: 'False',
        lastUpdateTime: '2023-02-08T13:51:58Z',
        lastTransitionTime: '2023-02-08T13:51:58Z',
        reason: 'MinimumReplicasUnavailable',
        message: 'Deployment does not have minimum availability.',
      },
      {
        type: 'ReplicaFailure',
        status: 'True',
        lastUpdateTime: '2023-02-08T13:51:58Z',
        lastTransitionTime: '2023-02-08T13:51:58Z',
        reason: 'FailedCreate',
        message:
          'pods "helloworld-5544d9965d-rpcpw" is forbidden: failed quota: example: must specify limits.cpu for: helloworld; limits.memory for: helloworld; requests.cpu for: helloworld; requests.memory for: helloworld',
      },
    ],
  },
};

export const mockPodData2 = {
  kind: 'Pod',
  apiVersion: 'v1',
  metadata: {
    generateName: 'helloworld-5544d9965d-',
    annotations: {
      'k8s.v1.cni.cncf.io/network-status':
        '[{\n    "name": "openshift-sdn",\n    "interface": "eth0",\n    "ips": [\n        "10.130.2.6"\n    ],\n    "default": true,\n    "dns": {}\n}]',
      'k8s.v1.cni.cncf.io/networks-status':
        '[{\n    "name": "openshift-sdn",\n    "interface": "eth0",\n    "ips": [\n        "10.130.2.6"\n    ],\n    "default": true,\n    "dns": {}\n}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
      'openshift.io/scc': 'restricted-v2',
      'seccomp.security.alpha.kubernetes.io/pod': 'runtime/default',
    },
    resourceVersion: '76507',
    name: 'helloworld-5544d9965d-ddnc5',
    uid: '79583e33-b810-4ee8-88dc-e3b852888968',
    creationTimestamp: '2023-02-08T13:49:21Z',
    managedFields: [
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-02-08T13:49:21Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:openshift.io/generated-by': {},
            },
            'f:generateName': {},
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:deployment': {},
              'f:pod-template-hash': {},
            },
            'f:ownerReferences': {
              '.': {},
              'k:{"uid":"bdb4259c-7fcf-40da-b059-549d939ea34b"}': {},
            },
          },
          'f:spec': {
            'f:containers': {
              'k:{"name":"helloworld"}': {
                '.': {},
                'f:image': {},
                'f:imagePullPolicy': {},
                'f:name': {},
                'f:ports': {
                  '.': {},
                  'k:{"containerPort":8080,"protocol":"TCP"}': {
                    '.': {},
                    'f:containerPort': {},
                    'f:protocol': {},
                  },
                },
                'f:resources': {},
                'f:terminationMessagePath': {},
                'f:terminationMessagePolicy': {},
              },
            },
            'f:dnsPolicy': {},
            'f:enableServiceLinks': {},
            'f:restartPolicy': {},
            'f:schedulerName': {},
            'f:securityContext': {},
            'f:terminationGracePeriodSeconds': {},
          },
        },
      },
      {
        manager: 'multus',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-02-08T13:49:23Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              'f:k8s.v1.cni.cncf.io/network-status': {},
              'f:k8s.v1.cni.cncf.io/networks-status': {},
            },
          },
        },
        subresource: 'status',
      },
      {
        manager: 'kubelet',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-02-08T13:49:26Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:status': {
            'f:conditions': {
              'k:{"type":"ContainersReady"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Initialized"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Ready"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
            },
            'f:containerStatuses': {},
            'f:hostIP': {},
            'f:phase': {},
            'f:podIP': {},
            'f:podIPs': {
              '.': {},
              'k:{"ip":"10.130.2.6"}': {
                '.': {},
                'f:ip': {},
              },
            },
            'f:startTime': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    ownerReferences: [
      {
        apiVersion: 'apps/v1',
        kind: 'ReplicaSet',
        name: 'helloworld-5544d9965d',
        uid: 'bdb4259c-7fcf-40da-b059-549d939ea34b',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
    labels: {
      app: 'helloworld',
      deployment: 'helloworld',
      'pod-template-hash': '5544d9965d',
    },
  },
  spec: {
    restartPolicy: 'Always',
    serviceAccountName: 'default',
    imagePullSecrets: [
      {
        name: 'default-dockercfg-jpglv',
      },
    ],
    priority: 0,
    schedulerName: 'default-scheduler',
    enableServiceLinks: true,
    terminationGracePeriodSeconds: 30,
    preemptionPolicy: 'PreemptLowerPriority',
    nodeName: 'ip-10-0-205-151.ec2.internal',
    securityContext: {
      seLinuxOptions: {
        level: 's0:c26,c15',
      },
      fsGroup: 1000680000,
      seccompProfile: {
        type: 'RuntimeDefault',
      },
    },
    containers: [
      {
        resources: {},
        terminationMessagePath: '/dev/termination-log',
        name: 'helloworld',
        securityContext: {
          capabilities: {
            drop: ['ALL'],
          },
          runAsUser: 1000680000,
          runAsNonRoot: true,
          allowPrivilegeEscalation: false,
        },
        ports: [
          {
            containerPort: 8080,
            protocol: 'TCP',
          },
        ],
        imagePullPolicy: 'Always',
        volumeMounts: [
          {
            name: 'kube-api-access-5cxqm',
            readOnly: true,
            mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
          },
        ],
        terminationMessagePolicy: 'File',
        image:
          'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
      },
    ],
    serviceAccount: 'default',
    volumes: [
      {
        name: 'kube-api-access-5cxqm',
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
    dnsPolicy: 'ClusterFirst',
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
  },
  status: {
    phase: 'Running',
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:49:21Z',
      },
      {
        type: 'Ready',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:49:26Z',
      },
      {
        type: 'ContainersReady',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:49:26Z',
      },
      {
        type: 'PodScheduled',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:49:21Z',
      },
    ],
    hostIP: '10.0.205.151',
    podIP: '10.130.2.6',
    podIPs: [
      {
        ip: '10.130.2.6',
      },
    ],
    startTime: '2023-02-08T13:49:21Z',
    containerStatuses: [
      {
        restartCount: 0,
        started: true,
        ready: true,
        name: 'helloworld',
        state: {
          running: {
            startedAt: '2023-02-08T13:49:25Z',
          },
        },
        imageID:
          'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
        image:
          'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
        lastState: {},
        containerID:
          'cri-o://a28f1250fe883b418011fc682ace4a28268c72a864c31fb7012ed8c2810e0c94',
      },
    ],
    qosClass: 'BestEffort',
  },
};

export const mockPodData3 = {
  kind: 'Pod',
  apiVersion: 'v1',
  metadata: {
    generateName: 'helloworld-5544d9965d-',
    annotations: {
      'k8s.v1.cni.cncf.io/network-status':
        '[{\n    "name": "openshift-sdn",\n    "interface": "eth0",\n    "ips": [\n        "10.131.2.6"\n    ],\n    "default": true,\n    "dns": {}\n}]',
      'k8s.v1.cni.cncf.io/networks-status':
        '[{\n    "name": "openshift-sdn",\n    "interface": "eth0",\n    "ips": [\n        "10.131.2.6"\n    ],\n    "default": true,\n    "dns": {}\n}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
      'openshift.io/scc': 'restricted-v2',
      'seccomp.security.alpha.kubernetes.io/pod': 'runtime/default',
    },
    resourceVersion: '79287',
    name: 'helloworld-5544d9965d-gm45k',
    uid: 'daa559d6-8b05-48d3-9905-7d6023c41961',
    creationTimestamp: '2023-02-08T13:52:49Z',
    managedFields: [
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-02-08T13:52:49Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:openshift.io/generated-by': {},
            },
            'f:generateName': {},
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:deployment': {},
              'f:pod-template-hash': {},
            },
            'f:ownerReferences': {
              '.': {},
              'k:{"uid":"bdb4259c-7fcf-40da-b059-549d939ea34b"}': {},
            },
          },
          'f:spec': {
            'f:containers': {
              'k:{"name":"helloworld"}': {
                '.': {},
                'f:image': {},
                'f:imagePullPolicy': {},
                'f:name': {},
                'f:ports': {
                  '.': {},
                  'k:{"containerPort":8080,"protocol":"TCP"}': {
                    '.': {},
                    'f:containerPort': {},
                    'f:protocol': {},
                  },
                },
                'f:resources': {},
                'f:terminationMessagePath': {},
                'f:terminationMessagePolicy': {},
              },
            },
            'f:dnsPolicy': {},
            'f:enableServiceLinks': {},
            'f:restartPolicy': {},
            'f:schedulerName': {},
            'f:securityContext': {},
            'f:terminationGracePeriodSeconds': {},
          },
        },
      },
      {
        manager: 'multus',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-02-08T13:52:51Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              'f:k8s.v1.cni.cncf.io/network-status': {},
              'f:k8s.v1.cni.cncf.io/networks-status': {},
            },
          },
        },
        subresource: 'status',
      },
      {
        manager: 'kubelet',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2023-02-08T13:56:09Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:status': {
            'f:conditions': {
              'k:{"type":"ContainersReady"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Initialized"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:status': {},
                'f:type': {},
              },
              'k:{"type":"Ready"}': {
                '.': {},
                'f:lastProbeTime': {},
                'f:lastTransitionTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
            },
            'f:containerStatuses': {},
            'f:hostIP': {},
            'f:podIP': {},
            'f:podIPs': {
              '.': {},
              'k:{"ip":"10.131.2.6"}': {
                '.': {},
                'f:ip': {},
              },
            },
            'f:startTime': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    ownerReferences: [
      {
        apiVersion: 'apps/v1',
        kind: 'ReplicaSet',
        name: 'helloworld-5544d9965d',
        uid: 'bdb4259c-7fcf-40da-b059-549d939ea34b',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
    labels: {
      app: 'helloworld',
      deployment: 'helloworld',
      'pod-template-hash': '5544d9965d',
    },
  },
  spec: {
    restartPolicy: 'Always',
    serviceAccountName: 'default',
    imagePullSecrets: [
      {
        name: 'default-dockercfg-jpglv',
      },
    ],
    priority: 0,
    schedulerName: 'default-scheduler',
    enableServiceLinks: true,
    terminationGracePeriodSeconds: 30,
    preemptionPolicy: 'PreemptLowerPriority',
    nodeName: 'ip-10-0-145-128.ec2.internal',
    securityContext: {
      seLinuxOptions: {
        level: 's0:c26,c15',
      },
      fsGroup: 1000680000,
      seccompProfile: {
        type: 'RuntimeDefault',
      },
    },
    containers: [
      {
        resources: {},
        terminationMessagePath: '/dev/termination-log',
        name: 'helloworld',
        securityContext: {
          capabilities: {
            drop: ['ALL'],
          },
          runAsUser: 1000680000,
          runAsNonRoot: true,
          allowPrivilegeEscalation: false,
        },
        ports: [
          {
            containerPort: 8080,
            protocol: 'TCP',
          },
        ],
        imagePullPolicy: 'Always',
        volumeMounts: [
          {
            name: 'kube-api-access-twd8j',
            readOnly: true,
            mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
          },
        ],
        terminationMessagePolicy: 'File',
        image:
          'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
      },
    ],
    serviceAccount: 'default',
    volumes: [
      {
        name: 'kube-api-access-twd8j',
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
    dnsPolicy: 'ClusterFirst',
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
  },
  status: {
    phase: 'Pending',
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:52:49Z',
      },
      {
        type: 'Ready',
        status: 'False',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:52:49Z',
        reason: 'ContainersNotReady',
        message: 'containers with unready status: [helloworld]',
      },
      {
        type: 'ContainersReady',
        status: 'False',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:52:49Z',
        reason: 'ContainersNotReady',
        message: 'containers with unready status: [helloworld]',
      },
      {
        type: 'PodScheduled',
        status: 'True',
        lastProbeTime: null,
        lastTransitionTime: '2023-02-08T13:52:49Z',
      },
    ],
    hostIP: '10.0.145.128',
    podIP: '10.131.2.6',
    podIPs: [
      {
        ip: '10.131.2.6',
      },
    ],
    startTime: '2023-02-08T13:52:49Z',
    containerStatuses: [
      {
        name: 'helloworld',
        state: {
          waiting: {
            reason: 'ImagePullBackOff',
            message:
              'Back-off pulling image "image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b"',
          },
        },
        lastState: {},
        ready: false,
        restartCount: 0,
        image:
          'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
        imageID: '',
        started: false,
      },
    ],
    qosClass: 'BestEffort',
  },
};

export const mockReplicasetData2 = {
  kind: 'ReplicaSet',
  apiVersion: 'apps/v1',
  metadata: {
    annotations: {
      'alpha.image.policy.openshift.io/resolve-names': '*',
      'app.openshift.io/route-disabled': 'false',
      'deployment.kubernetes.io/desired-replicas': '3',
      'deployment.kubernetes.io/max-replicas': '4',
      'deployment.kubernetes.io/revision': '1',
      'image.openshift.io/triggers':
        '[{"from":{"kind":"ImageStreamTag","name":"helloworld:latest","namespace":"jai-test"},"fieldPath":"spec.template.spec.containers[?(@.name==\\"helloworld\\")].image","pause":"false"}]',
      'openshift.io/generated-by': 'OpenShiftWebConsole',
    },
    resourceVersion: '77851',
    name: 'helloworld-5544d9965d',
    uid: 'bdb4259c-7fcf-40da-b059-549d939ea34b',
    creationTimestamp: '2023-02-08T13:49:21Z',
    generation: 3,
    managedFields: [
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-02-08T13:52:08Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:annotations': {
              '.': {},
              'f:alpha.image.policy.openshift.io/resolve-names': {},
              'f:app.openshift.io/route-disabled': {},
              'f:deployment.kubernetes.io/desired-replicas': {},
              'f:deployment.kubernetes.io/max-replicas': {},
              'f:deployment.kubernetes.io/revision': {},
              'f:image.openshift.io/triggers': {},
              'f:openshift.io/generated-by': {},
            },
            'f:labels': {
              '.': {},
              'f:app': {},
              'f:deployment': {},
              'f:pod-template-hash': {},
            },
            'f:ownerReferences': {
              '.': {},
              'k:{"uid":"3d338bc2-6919-474c-926a-450f0ceed665"}': {},
            },
          },
          'f:spec': {
            'f:replicas': {},
            'f:selector': {},
            'f:template': {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:openshift.io/generated-by': {},
                },
                'f:labels': {
                  '.': {},
                  'f:app': {},
                  'f:deployment': {},
                  'f:pod-template-hash': {},
                },
              },
              'f:spec': {
                'f:containers': {
                  'k:{"name":"helloworld"}': {
                    '.': {},
                    'f:image': {},
                    'f:imagePullPolicy': {},
                    'f:name': {},
                    'f:ports': {
                      '.': {},
                      'k:{"containerPort":8080,"protocol":"TCP"}': {
                        '.': {},
                        'f:containerPort': {},
                        'f:protocol': {},
                      },
                    },
                    'f:resources': {},
                    'f:terminationMessagePath': {},
                    'f:terminationMessagePolicy': {},
                  },
                },
                'f:dnsPolicy': {},
                'f:restartPolicy': {},
                'f:schedulerName': {},
                'f:securityContext': {},
                'f:terminationGracePeriodSeconds': {},
              },
            },
          },
        },
      },
      {
        manager: 'kube-controller-manager',
        operation: 'Update',
        apiVersion: 'apps/v1',
        time: '2023-02-08T13:52:49Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:status': {
            'f:availableReplicas': {},
            'f:conditions': {
              '.': {},
              'k:{"type":"ReplicaFailure"}': {
                '.': {},
                'f:lastTransitionTime': {},
                'f:message': {},
                'f:reason': {},
                'f:status': {},
                'f:type': {},
              },
            },
            'f:fullyLabeledReplicas': {},
            'f:observedGeneration': {},
            'f:readyReplicas': {},
            'f:replicas': {},
          },
        },
        subresource: 'status',
      },
    ],
    namespace: 'jai-test',
    ownerReferences: [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: 'helloworld',
        uid: '3d338bc2-6919-474c-926a-450f0ceed665',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
    labels: {
      app: 'helloworld',
      deployment: 'helloworld',
      'pod-template-hash': '5544d9965d',
    },
  },
  spec: {
    replicas: 3,
    selector: {
      matchLabels: {
        app: 'helloworld',
        'pod-template-hash': '5544d9965d',
      },
    },
    template: {
      metadata: {
        creationTimestamp: null,
        labels: {
          app: 'helloworld',
          deployment: 'helloworld',
          'pod-template-hash': '5544d9965d',
        },
        annotations: {
          'openshift.io/generated-by': 'OpenShiftWebConsole',
        },
      },
      spec: {
        containers: [
          {
            name: 'helloworld',
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/helloworld@sha256:abbd8e0e1da79a0f2731a792105a7e525b99ee32ef0de2a0d4a73e2b575f4e0b',
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
    replicas: 2,
    fullyLabeledReplicas: 2,
    readyReplicas: 1,
    availableReplicas: 1,
    observedGeneration: 3,
    conditions: [
      {
        type: 'ReplicaFailure',
        status: 'True',
        lastTransitionTime: '2023-02-08T13:51:58Z',
        reason: 'FailedCreate',
        message:
          'pods "helloworld-5544d9965d-rpcpw" is forbidden: failed quota: example: must specify limits.cpu for: helloworld; limits.memory for: helloworld; requests.cpu for: helloworld; requests.memory for: helloworld',
      },
    ],
  },
};
