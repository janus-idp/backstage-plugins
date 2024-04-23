import { Application } from '../../src/types';

export const mockApplication: Application = {
  metadata: {
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    labels: {
      'rht-gitops.com/janus-argocd': 'quarkus-app-bootstrap',
    },
    instance: { name: 'main' },
    name: 'quarkus-app-dev',
  },
  spec: {
    destination: {
      namespace: 'quarkus-app-dev',
      server: 'https://kubernetes.default.svc',
    },
    project: 'janus',
    source: {
      helm: {
        parameters: [
          {
            name: 'namespace.name',
            value: 'quarkus-app-dev',
          },
          {
            name: 'environment',
            value: 'dev',
          },
          {
            name: 'image.tag',
            value: 'latest',
          },
        ],
      },
      path: './helm/app',
      repoURL:
        'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
      targetRevision: 'HEAD',
    },
  },
  status: {
    history: [
      {
        revision: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-22T05:39:24Z',
        id: 0,
        source: {
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
          path: './helm/app',
          targetRevision: 'HEAD',
          helm: {
            parameters: [
              {
                name: 'namespace.name',
                value: 'quarkus-app-dev',
              },
              {
                name: 'environment',
                value: 'dev',
              },
              {
                name: 'image.tag',
                value: 'latest',
              },
            ],
          },
        },
        deployStartedAt: '2024-04-22T05:39:23Z',
      },
      {
        revision: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-22T16:57:40Z',
        id: 1,
        source: {
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
          path: './helm/app',
          targetRevision: 'HEAD',
          helm: {
            parameters: [
              {
                name: 'namespace.name',
                value: 'quarkus-app-dev',
              },
              {
                name: 'environment',
                value: 'dev',
              },
              {
                name: 'image.tag',
                value: 'latest',
              },
            ],
          },
        },
        deployStartedAt: '2024-04-22T16:57:40Z',
      },
    ],
    health: {
      status: 'Healthy',
    },
    operationState: {
      operation: {
        sync: {
          prune: true,
          revision: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
          syncOptions: [
            'RespectIgnoreDifferences=true',
            'ApplyOutOfSyncOnly=true',
          ],
        },
      },
      phase: 'Succeeded',
    },
    summary: {
      images: ['quay-hw6fw.apps.cluster.test.com/quayadmin/quarkus-app:latest'],
    },
    sync: {
      status: 'Synced',
    },
  },
};

export const preProdApplication = {
  metadata: {
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    labels: {
      'rht-gitops.com/janus-argocd': 'quarkus-app-bootstrap',
    },
    instance: { name: 'main' },
    name: 'quarkus-app-preprod',
  },
  spec: {
    destination: {
      namespace: 'quarkus-app-preprod',
      server: 'https://kubernetes.default.svc',
    },
    project: 'janus',
    source: {
      helm: {
        parameters: [
          {
            name: 'namespace.name',
            value: 'quarkus-app-pre-prod',
          },
          {
            name: 'environment',
            value: 'dev',
          },
          {
            name: 'image.tag',
            value: 'preprod',
          },
        ],
      },
      path: './helm/app',
      repoURL:
        'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
      targetRevision: 'HEAD',
    },
  },
  status: {
    history: [
      {
        revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-22T05:39:24Z',
        id: 0,
        source: {
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
          path: './helm/app',
          targetRevision: 'HEAD',
          helm: {
            parameters: [
              {
                name: 'namespace.name',
                value: 'quarkus-app-preprod',
              },
              {
                name: 'environment',
                value: 'dev',
              },
              {
                name: 'image.tag',
                value: 'latest',
              },
            ],
          },
        },
        deployStartedAt: '2024-04-22T05:39:23Z',
      },
      {
        revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-20T16:57:40Z',
        id: 1,
        source: {
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
          path: './helm/app',
          targetRevision: 'HEAD',
          helm: {
            parameters: [
              {
                name: 'namespace.name',
                value: 'quarkus-app-preprod',
              },
              {
                name: 'environment',
                value: 'dev',
              },
              {
                name: 'image.tag',
                value: 'preprod',
              },
            ],
          },
        },
        deployStartedAt: '2024-04-22T16:57:40Z',
      },
    ],
    health: {
      status: 'Degraded',
    },
    operationState: {
      operation: {
        sync: {
          prune: true,
          revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
          syncOptions: [
            'RespectIgnoreDifferences=true',
            'ApplyOutOfSyncOnly=true',
          ],
        },
      },
      phase: 'Succeeded',
    },
    summary: {
      images: ['quay-hw6fw.apps.cluster.test.com/quayadmin/quarkus-app:latest'],
    },
    sync: {
      status: 'Synced',
    },
  },
};

export const prodApplication = {
  metadata: {
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    labels: {
      'rht-gitops.com/janus-argocd': 'quarkus-app-bootstrap',
    },
    instance: { name: 'main' },
    name: 'quarkus-app-prod',
  },
  spec: {
    destination: {
      namespace: 'quarkus-app-prod',
      server: 'https://kubernetes.default.svc',
    },
    project: 'janus',
    source: {
      helm: {
        parameters: [
          {
            name: 'namespace.name',
            value: 'quarkus-app-pre-prod',
          },
          {
            name: 'environment',
            value: 'dev',
          },
          {
            name: 'image.tag',
            value: 'prod',
          },
        ],
      },
      path: './helm/app',
      repoURL:
        'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
      targetRevision: 'HEAD',
    },
  },
  status: {
    history: [
      {
        revision: '70f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-19T05:39:24Z',
        id: 0,
        source: {
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
          path: './helm/app',
          targetRevision: 'HEAD',
          helm: {
            parameters: [
              {
                name: 'namespace.name',
                value: 'quarkus-app-prod',
              },
              {
                name: 'environment',
                value: 'dev',
              },
              {
                name: 'image.tag',
                value: 'latest',
              },
            ],
          },
        },
        deployStartedAt: '2024-04-22T05:39:23Z',
      },
      {
        revision: '70f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-19T16:57:40Z',
        id: 1,
        source: {
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
          path: './helm/app',
          targetRevision: 'HEAD',
          helm: {
            parameters: [
              {
                name: 'namespace.name',
                value: 'quarkus-app-prod',
              },
              {
                name: 'environment',
                value: 'dev',
              },
              {
                name: 'image.tag',
                value: 'prod',
              },
            ],
          },
        },
        deployStartedAt: '2024-04-22T16:57:40Z',
      },
    ],
    health: {
      status: 'Missing',
    },
    operationState: {
      operation: {
        sync: {
          prune: true,
          revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
          syncOptions: [
            'RespectIgnoreDifferences=true',
            'ApplyOutOfSyncOnly=true',
          ],
        },
      },
      phase: 'Succeeded',
    },
    summary: {
      images: ['quay-hw6fw.apps.cluster.test.com/quayadmin/quarkus-app:latest'],
    },
    sync: {
      status: 'OutOfSync',
    },
  },
};
