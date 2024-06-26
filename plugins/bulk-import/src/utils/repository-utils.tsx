import React from 'react';

import { Link } from '@backstage/core-components';

import { get } from 'lodash';

import { formatDate } from '@janus-idp/shared-react';

import {
  AddedRepositories,
  AddRepositoriesData,
  Order,
  RepositoryStatus,
} from '../types';

const descendingComparator = (
  a: AddRepositoriesData,
  b: AddRepositoriesData,
  orderBy: string,
  isOrganization: boolean,
) => {
  let value1 = get(a, orderBy);
  let value2 = get(b, orderBy);
  const order = {
    [RepositoryStatus.Exists]: 1,
    [RepositoryStatus.Ready]: 2,
    [RepositoryStatus.NotGenerated]: 3,
    [RepositoryStatus.Failed]: 4,
  };

  if (orderBy === 'selectedRepositories') {
    value1 = value1?.length;
    value2 = value2?.length;
  }

  if (orderBy === 'catalogInfoYaml') {
    if (isOrganization) {
      value1 =
        order[
          (a.selectedRepositories?.[0]?.catalogInfoYaml
            ?.status as RepositoryStatus) || RepositoryStatus.NotGenerated
        ];
      value2 =
        order[
          (b.selectedRepositories?.[0]?.catalogInfoYaml
            ?.status as RepositoryStatus) || RepositoryStatus.NotGenerated
        ];
    } else {
      value1 =
        order[
          (value1?.status as RepositoryStatus) || RepositoryStatus.NotGenerated
        ];
      value2 =
        order[
          (value2?.status as RepositoryStatus) || RepositoryStatus.NotGenerated
        ];
    }
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
  isOrganization: boolean,
): ((a: AddRepositoriesData, b: AddRepositoriesData) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy, isOrganization)
    : (a, b) => -descendingComparator(a, b, orderBy, isOrganization);
};

export const getPRTemplate = (componentName: string, entityOwner: string) => {
  return {
    componentName,
    entityOwner,
    prTitle: 'This is the pull request title',
    prDescription: 'This is the description of the pull request',
    useCodeOwnersFile: false,
    yaml: {
      kind: 'Component',
      apiVersion: 'v1',
      metadata: { name: componentName },
    },
  };
};

export const createData = (
  id: number,
  name: string,
  url: string,
  catalogInfoYamlStatus: string,
  entityOwner: string,
  organization?: string,
): AddRepositoriesData => {
  return {
    id,
    repoName: name,
    repoUrl: url,
    orgName: organization,
    organizationUrl: organization,
    catalogInfoYaml: {
      status: catalogInfoYamlStatus,
      prTemplate: getPRTemplate(name, entityOwner),
    },
    lastUpdated: formatDate(new Date().toISOString()),
  };
};

export const createOrganizationData = (
  repositories: AddRepositoriesData[],
): AddRepositoriesData[] => {
  return repositories.reduce(
    (acc: AddRepositoriesData[], repo: AddRepositoriesData) => {
      const org = acc.find(a => a.organizationUrl === repo.organizationUrl);
      if (org?.repositories) {
        org.repositories.push(repo);
      } else {
        acc.push({
          id: repo.id,
          orgName: repo.organizationUrl,
          organizationUrl: repo.organizationUrl,
          repositories: [repo],
          selectedRepositories: [],
          lastUpdated: formatDate(new Date().toISOString()),
          repoName: repo.organizationUrl || '',
        });
      }
      return acc;
    },
    [],
  );
};

export const getSelectedRepositoriesCount = (
  onOrgRowSelected: (org: AddRepositoriesData) => void,
  organizationData: AddRepositoriesData,
  alreadyAdded: number,
) => {
  if (
    !organizationData ||
    organizationData.selectedRepositories?.length === 0
  ) {
    return (
      <span data-testid="select-repositories">
        None{' '}
        <Link to="" onClick={() => onOrgRowSelected(organizationData)}>
          Select
        </Link>
      </span>
    );
  }
  return (
    <span data-testid="edit-repositories">
      {organizationData.selectedRepositories?.length} /{' '}
      {(organizationData.repositories?.length || 0) - alreadyAdded}{' '}
      <Link onClick={() => onOrgRowSelected(organizationData)} to="">
        Edit
      </Link>
    </span>
  );
};

export const updateWithNewSelectedRepositories = (
  data: AddRepositoriesData[],
  existingSelectedRepositories: AddedRepositories,
  selectedRepoIds: number[],
): AddedRepositories => {
  return selectedRepoIds.length === 0
    ? {}
    : selectedRepoIds.reduce((acc, id) => {
        const existingRepo = Object.values(existingSelectedRepositories).find(
          repo => repo.id === id,
        );
        if (existingRepo) {
          return {
            ...acc,
            ...{ [existingRepo.repoName as string]: existingRepo },
          };
        }
        const repo = data.find((d: AddRepositoriesData) => id === d.id);
        if (repo) {
          return {
            ...acc,
            ...{
              [repo.repoName as string]: {
                ...repo,
                catalogInfoYaml: {
                  ...repo.catalogInfoYaml,
                  status: RepositoryStatus.Ready,
                },
              },
            },
          };
        }
        return acc;
      }, {});
};

export const getSelectedRepositories = (
  org: AddRepositoriesData,
  drawerSelected: number[],
): AddRepositoriesData[] => {
  return drawerSelected
    .filter(selId => org.repositories?.some(repo => repo.id === selId))
    .reduce((acc: AddRepositoriesData[], id) => {
      const repository = org.repositories?.find(repo => repo.id === id);
      if (repository) {
        acc.push(repository);
      }
      return acc;
    }, []);
};

export const filterSelectedForActiveDrawer = (
  repositories: AddRepositoriesData[],
  selectedReposID: number[],
) => {
  return selectedReposID
    .filter(id => id > -1)
    .filter(id => repositories?.map(r => r.id).includes(id));
};

export const urlHelper = (url: string) => {
  if (!url || url === '') {
    return '-';
  }
  return url.split('https://')[1] || url;
};

export const getNewOrgsData = (
  orgsData: AddRepositoriesData[],
  reposData: AddRepositoriesData[],
  newSelected: number[],
  id: number,
) => {
  const orgId = orgsData.find(
    org => org.orgName === reposData.find(repo => repo.id === id)?.orgName,
  )?.id;

  const selectedRepositories = newSelected.filter(selId =>
    orgsData
      .find(org => org.id === orgId)
      ?.repositories?.map(r => r.id)
      .includes(selId),
  );
  const newOrgsData = orgsData.map(org => {
    if (org.id === orgId) {
      return {
        ...org,
        selectedRepositories:
          (selectedRepositories
            .map(repoId => reposData.find(repo => repo.id === repoId))
            .filter(r => r?.id) as AddRepositoriesData[]) || [],
      };
    }
    return org;
  });
  return newOrgsData;
};
