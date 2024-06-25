import { get } from 'lodash';

import { ImportJobResponse } from '../types/response-types';
import {
  AddedRepositories,
  AddRepositoryData,
  ImportStatus,
  Order,
  RepositorySelection,
  RepositoryStatus,
} from '../types/types';

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

export const getImportStatus = (status: string): string => {
  if (!status) {
    return '';
  }
  switch (status) {
    case 'WAIT_PR_APPROVAL':
      return 'Waiting for PR Approval';
    case 'ADDED':
      return 'Finished and Ingested';
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

export const shouldExcludeRepositories = (status: string) =>
  status === RepositoryStatus.ADDED ||
  status === RepositoryStatus.WAIT_PR_APPROVAL;

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

export const getJobErrors = (createJobResponse: ImportJobResponse[]) => {
  return createJobResponse.reduce((acc, res) => {
    if (res.errors?.length > 0) {
      return {
        ...acc,
        [`${res.repository.organization}/${res.repository.name}`]: {
          repository: res.repository,
          catalogEntityName: res.catalogEntityName,
          error: {
            message: res.errors.join('.'),
            status: res.status,
          },
        },
      };
    }
    return acc;
  }, {});
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
