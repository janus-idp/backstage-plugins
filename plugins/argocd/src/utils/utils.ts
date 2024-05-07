import { Entity } from '@backstage/catalog-model';

import { Application, OperationPhases, OperationState } from '../types';

export const enum ArgoCdLabels {
  appSelector = 'argocd/app-selector',
  instanceName = 'argocd/instance-name',
  projectName = 'argocd/project-name',
}

export const getAppSelector = (entity: Entity): string => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.appSelector] ?? '';
};

export const getInstanceName = (entity: Entity): string => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.instanceName] ?? '';
};

export const getProjectName = (entity: Entity): string | undefined => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.projectName];
};

type ProviderType = 'github' | 'gitlab' | 'unknown';

export enum Providers {
  github = 'github',
  gitlab = 'gitlab',
  unknown = 'unknown',
}

export enum KnownProviders {
  gitlab = 'gitlab.com',
  github = 'github.com',
}

export const getGitProvider = (annotations: {
  [key: string]: string;
}): ProviderType => {
  const entityKeys = Object.keys(annotations ?? {});
  if (entityKeys.length === 0) {
    return Providers.unknown;
  }
  let provider: ProviderType = Providers.unknown;
  entityKeys.forEach(key => {
    if (provider !== Providers.unknown) {
      return;
    }
    if (
      key.startsWith(KnownProviders.gitlab) ||
      annotations[key].includes(KnownProviders.gitlab)
    ) {
      provider = Providers.gitlab;
    } else if (
      key.startsWith(KnownProviders.github) ||
      annotations[key].includes(KnownProviders.github)
    ) {
      provider = Providers.github;
    } else {
      provider = Providers.unknown;
    }
  });

  return provider;
};

export const getCommitUrl = (
  url: string,
  revisionId: string,
  annotations: { [key: string]: string },
) => {
  const sanitizedUrl = url.replace('.git', '');
  const providerCommitPrefix: { [key in ProviderType]: string } = {
    gitlab: '/-/commit/',
    github: '/commit/',
    unknown: '',
  };

  let provider: ProviderType = Providers.unknown;

  if (provider === Providers.unknown) {
    provider = getGitProvider(annotations);
  }

  return provider === Providers.unknown
    ? sanitizedUrl
    : `${sanitizedUrl}${providerCommitPrefix[provider]}${revisionId}`;
};

export const getAppOperationState = (app: Application): OperationState => {
  if (app.operation) {
    return {
      phase: OperationPhases.Running,
      message:
        (app.status &&
          app.status.operationState &&
          app.status.operationState.message) ||
        'waiting to start',
      startedAt: new Date().toISOString(),
      operation: {
        sync: {},
      },
    } as OperationState;
  } else if (app.metadata.deletionTimestamp) {
    return {
      phase: OperationPhases.Running,
      message: '',
      startedAt: app.metadata.deletionTimestamp,
      operation: {
        sync: {},
      },
    } as any;
  }
  return app.status.operationState;
};

export const getUniqueRevisions = (apps: Application[]): string[] =>
  apps
    ? apps.reduce((acc, app) => {
        const history = app?.status?.history ?? [];
        const revisions: string[] = [];

        if (history.length > 0) {
          history.forEach(h => {
            if (!revisions.includes(h.revision as string)) {
              revisions.push(h.revision);
            }
          });
        }

        revisions.forEach((rev: string) => {
          if (!acc.includes(rev)) {
            acc.push(rev);
          }
        });

        return acc;
      }, [] as string[])
    : [];
