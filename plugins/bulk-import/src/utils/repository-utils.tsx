import * as React from 'react';

import { StatusOK, StatusPending } from '@backstage/core-components';

import { get } from 'lodash';
import * as yaml from 'yaml';

import GitAltIcon from '../components/GitAltIcon';
import {
  AddedRepositories,
  AddRepositoryData,
  APITypes,
  ApprovalTool,
  CreateImportJobRepository,
  ErrorType,
  ImportJobResponse,
  ImportStatus,
  JobErrors,
  Order,
  RepositorySelection,
  RepositoryStatus,
} from '../types';

export const descendingComparator = (
  a: AddRepositoryData,
  b: AddRepositoryData,
  orderBy: string,
) => {
  let value1 = get(a, orderBy);
  let value2 = get(b, orderBy);
  const order = {
    [RepositoryStatus.ADDED]: 1,
    [RepositoryStatus.Ready]: 2,
    [RepositoryStatus.WAIT_PR_APPROVAL]: 3,
    [RepositoryStatus.PR_ERROR]: 4,
    [RepositoryStatus.CATALOG_ENTITY_CONFLICT]: 4,
    [RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO]: 4,
    [RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO]: 4,
    [RepositoryStatus.REPO_EMPTY]: 4,
    [RepositoryStatus.NotGenerated]: 5,
  };

  if (orderBy === 'selectedRepositories') {
    value1 = value1?.length;
    value2 = value2?.length;
  }

  if (orderBy === 'catalogInfoYaml.status') {
    value1 = order[(value1 as ImportStatus) || RepositoryStatus.NotGenerated];
    value2 = order[(value2 as ImportStatus) || RepositoryStatus.NotGenerated];
  }
  if (value2 < value1) {
    return -1;
  }
  if (value2 > value1) {
    return 1;
  }
  return 0;
};

export const getComparator = (
  order: Order,
  orderBy: string,
): ((a: AddRepositoryData, b: AddRepositoryData) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export const defaultCatalogInfoYaml = (
  componentName: string,
  orgName: string,
  owner: string,
) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: componentName,
    annotations: { 'github.com/project-slug': `${orgName}/${componentName}` },
  },
  spec: { type: 'other', lifecycle: 'unknown', owner },
});

export const getPRTemplate = (
  componentName: string,
  orgName: string,
  entityOwner: string,
) => {
  return {
    componentName,
    entityOwner,
    prTitle: 'Add catalog-info.yaml config file',
    prDescription:
      'This pull request adds a **Backstage entity metadata file**\nto this repository so that the component can\nbe added to the [software catalog](http://localhost:3000).\nAfter this pull request is merged, the component will become available.\nFor more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).',
    useCodeOwnersFile: false,
    yaml: defaultCatalogInfoYaml(componentName, orgName, entityOwner),
  };
};

export const getYamlKeyValuePairs = (
  prYamlInput: string,
): Record<string, string> => {
  const keyValuePairs: Record<string, string> = {};
  const keyValueEntries = prYamlInput.split(';').map(entry => entry.trim());

  keyValueEntries.forEach(entry => {
    const [key, ...valueParts] = entry.split(':');
    const value = valueParts.join(':').trim();
    if (key && value) {
      keyValuePairs[key.trim()] = value.replace(/(^['"])|(['"]$)/g, '');
    }
  });

  return keyValuePairs;
};

export const updateWithNewSelectedRepositories = (
  existingSelectedRepositories: AddedRepositories,
  selectedRepos: AddedRepositories,
): AddedRepositories => {
  return Object.keys(selectedRepos).length === 0
    ? {}
    : Object.keys(selectedRepos).reduce((acc, sr) => {
        const existingRepo = existingSelectedRepositories[sr];
        if (existingRepo) {
          return {
            ...acc,
            ...{ [existingRepo.id]: existingRepo },
          };
        }
        return {
          ...acc,
          ...{
            [sr]: {
              ...selectedRepos[sr],
              catalogInfoYaml: {
                ...selectedRepos[sr].catalogInfoYaml,
                status: RepositoryStatus.Ready,
              },
            },
          },
        };
      }, {});
};

export const filterSelectedForActiveDrawer = (
  repositories: AddRepositoryData[],
  selectedRepos: AddedRepositories,
): AddedRepositories => {
  return Object.keys(selectedRepos).reduce(
    (acc, repoId) =>
      repositories?.map(r => r.id).includes(repoId)
        ? { ...acc, repoId: selectedRepos[repoId] }
        : acc,
    {},
  );
};

export const urlHelper = (url: string) => {
  if (!url || url === '') {
    return '-';
  }
  return url.split('https://')[1] || url;
};

export const getNewOrgsData = (
  orgsData: { [name: string]: AddRepositoryData },
  repo: AddRepositoryData,
): { [name: string]: AddRepositoryData } => {
  const org = Object.values(orgsData)?.find(o => o.orgName === repo.orgName);

  let selectedRepositories = { ...(org?.selectedRepositories || {}) };
  selectedRepositories = selectedRepositories[repo.id]
    ? Object.keys(selectedRepositories).reduce(
        (acc, sr) => (sr === repo.id ? { ...acc, [repo.id]: repo } : acc),
        {},
      )
    : { ...selectedRepositories, [repo.id]: repo };

  const newOrgsData =
    org &&
    Object.values(orgsData)?.reduce((acc, od) => {
      if (od.orgName === org.orgName) {
        return {
          ...acc,
          [org.orgName as string]: {
            ...org,
            selectedRepositories: selectedRepositories || [],
          },
        };
      }
      return acc;
    }, {});
  return newOrgsData || [];
};

export const getImportStatus = (status: string, showIcon?: boolean) => {
  if (!status) {
    return '';
  }
  switch (status) {
    case 'WAIT_PR_APPROVAL':
      return showIcon ? (
        <span style={{ display: 'flex' }}>
          <StatusPending />
          <GitAltIcon
            style={{
              height: '1.4em',
              width: '2em',
              marginBottom: 'auto',
              marginRight: '4px',
            }}
          />
          Waiting for Approval
        </span>
      ) : (
        'Waiting for Approval'
      );
    case 'ADDED':
      return showIcon ? (
        <span style={{ display: 'flex', alignItems: 'baseline' }}>
          <StatusOK />
          Added
        </span>
      ) : (
        'Added'
      );
    default:
      return '';
  }
};

export const evaluateRowForRepo = (
  tableData: AddRepositoryData[],
  selectedRepositories: AddedRepositories,
) => {
  return tableData.map(td => {
    const repo = selectedRepositories[td.id];
    if (repo) {
      const newtd = {
        ...td,
        catalogInfoYaml: repo.catalogInfoYaml,
      };
      return newtd;
    }
    return td;
  });
};

export const evaluateRowForOrg = (
  tableData: AddRepositoryData[],
  selectedRepositories: AddedRepositories,
) => {
  return tableData?.map(td => {
    const selectedReposFromOrg =
      Object.values(selectedRepositories)?.reduce(
        (acc, repo) =>
          repo.orgName === td.orgName ? { ...acc, [repo.id]: repo } : acc,
        {},
      ) || [];

    const orgRowData = {
      ...td,
      selectedRepositories: selectedReposFromOrg,
      ...(Object.keys(selectedReposFromOrg)?.length > 0
        ? {
            catalogInfoYaml: {
              status: RepositoryStatus.Ready,
            },
          }
        : {}),
    };
    return orgRowData;
  });
};

export const areAllRowsSelected = (
  repositoryType: RepositorySelection,
  alreadyAdded: number,
  isItemSelected: boolean | undefined,
  orgRepositoriesCount: number,
  selectedRepositories: AddedRepositories,
) => {
  return repositoryType === RepositorySelection.Organization
    ? (Object.keys(selectedRepositories)?.length || 0) + alreadyAdded ===
        orgRepositoriesCount
    : !!isItemSelected;
};

export const getJobErrors = (
  createJobResponse: ImportJobResponse[],
): JobErrors => {
  return createJobResponse.reduce(
    (acc: JobErrors, res: ImportJobResponse) => {
      if (res.errors?.length > 0) {
        const errs =
          res.status === RepositoryStatus.PR_ERROR
            ? [res.status]
            : res.errors.filter(
                e => e !== RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO,
              );
        const hasInfo = res.errors.includes(
          RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO,
        );
        const repoId = `${res.repository.organization}/${res.repository.name}`;
        const repoErr: ErrorType = {
          [`${repoId}`]: {
            repository: {
              name: res.repository.name || '',
              organization: res.repository.organization || '',
            },
            catalogEntityName: res.catalogEntityName || '',
            error: {
              message: errs,
            },
          },
        };

        const repoInfo: ErrorType = {
          [`${repoId}`]: {
            ...repoErr[`${repoId}`],
            error: {
              message: [RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO],
            },
          },
        };
        return {
          ...acc,
          ...(hasInfo ? { infos: { ...acc.infos, ...repoInfo } } : {}),
          ...(errs.length > 0 ? { errors: { ...acc.errors, ...repoErr } } : {}),
        };
      }
      return acc;
    },
    { infos: null, errors: null } as JobErrors,
  );
};

export const convertKeyValuePairsToString = (
  keyValuePairs?: Record<string, string>,
): string => {
  return keyValuePairs
    ? Object.entries(keyValuePairs)
        .map(([key, value]) => `${key.trim()}: ${value.trim()}`)
        .join('; ')
    : '';
};

export const prepareDataForSubmission = (
  repositories: AddedRepositories,
  approvalTool: ApprovalTool,
) =>
  Object.values(repositories).reduce(
    (acc: CreateImportJobRepository[], repo) => {
      acc.push({
        approvalTool: approvalTool.toLocaleUpperCase(),
        codeOwnersFileAsEntityOwner:
          repo.catalogInfoYaml?.prTemplate?.useCodeOwnersFile || false,
        catalogEntityName:
          repo.catalogInfoYaml?.prTemplate?.componentName ||
          repo?.repoName ||
          'my-component',
        repository: {
          id: repo.id,
          url: repo.repoUrl || '',
          name: repo.repoName || '',
          organization: repo.orgName || '',
          defaultBranch: repo.defaultBranch || '',
        },
        catalogInfoContent: yaml.stringify(
          repo.catalogInfoYaml?.prTemplate?.yaml,
          null,
          2,
        ),
        github: {
          pullRequest: {
            title:
              repo.catalogInfoYaml?.prTemplate?.prTitle ||
              'Add catalog-info.yaml config file',
            body:
              repo.catalogInfoYaml?.prTemplate?.prDescription ||
              'This pull request adds a **Backstage entity metadata file**\nto this repository so that the component can\nbe added to the [software catalog](http://localhost:3000).\nAfter this pull request is merged, the component will become available.\nFor more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).',
          },
        },
      });
      return acc;
    },
    [],
  );

export const getApi = (
  backendUrl: string,
  page: number,
  size: number,
  options: APITypes,
) => {
  if (options.fetchRepositories) {
    return `${backendUrl}/api/bulk-import/repositories?pagePerIntegration=${page}&sizePerIntegration=${size}`;
  }
  if (options.orgName) {
    return `${backendUrl}/api/bulk-import/organizations/${options.orgName}/repositories?pagePerIntegration=${page}&sizePerIntegration=${size}`;
  }
  if (options.fetchOrganizations) {
    return `${backendUrl}/api/bulk-import/organizations?pagePerIntegration=${page}&sizePerIntegration=${size}`;
  }
  return '';
};

export const getCustomisedErrorMessage = (
  status: RepositoryStatus[] | null,
) => {
  let message = '';
  status?.forEach(s => {
    if (s === RepositoryStatus.PR_ERROR) {
      message = message.concat(
        "Couldn't create a new PR due to insufficient permissions. Contact your administrator.",
        '\n',
      );
    }

    if (s === RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO) {
      message = message.concat(
        'Since catalog-info.yaml already exists in the repository, no new PR will be created. However, the entity will still be registered in the catalog page.',
        '\n',
      );
    }

    if (s === RepositoryStatus.CATALOG_ENTITY_CONFLICT) {
      message = message.concat(
        "Couldn't create a new PR because of a conflict.",
        '\n',
      );
    }

    if (s === RepositoryStatus.REPO_EMPTY) {
      message = message.concat(
        "Couldn't create a new PR because the repository is empty. Push an initial commit to the repository.",
        '\n',
      );
    }

    if (s === RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO) {
      message = message.concat(
        'CODEOWNERS file is missing from the repository. Add a CODEOWNERS file to create a new PR.',
        '\n',
      );
    }
  });
  return message;
};

export const calculateLastUpdated = (dateString: string) => {
  if (!dateString) {
    return '';
  }

  const givenDate = new Date(dateString);
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const diffInMilliseconds: number =
    currentDate.getTime() - givenDate.getTime();

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays > 1 ? 'days' : 'day'} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours > 1 ? 'hours' : 'hour'} ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes > 1 ? 'minutes' : 'minute'} ago`;
  }
  return `${diffInSeconds} ${diffInSeconds > 1 ? 'seconds' : 'second'} ago`;
};
