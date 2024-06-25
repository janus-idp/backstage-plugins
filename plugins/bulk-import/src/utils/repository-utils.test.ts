import {
  mockGetRepositories,
  mockSelectedRepositories,
} from '../mocks/mockData';
import { ImportJobResponse, RepositoryStatus } from '../types';
import {
  getJobErrors,
  getNewOrgsData,
  getYamlKeyValuePairs,
  updateWithNewSelectedRepositories,
  urlHelper,
} from './repository-utils';

describe('Repository utils', () => {
  it('should evaluate the newly selected repositories in the organization drawer', () => {
    const addedRepositories = updateWithNewSelectedRepositories(
      mockSelectedRepositories,
      {
        ...mockSelectedRepositories,
        ['org/food/food-app']: {
          id: 'org/food/food-app',
          repoName: 'food-app',
          repoUrl: 'https://github.com/org/food/food-app',
          defaultBranch: 'master',
          organizationUrl: 'org/food',
        },
        ['org/pet-store-boston/online-store']: {
          id: 'org/pet-store-boston/online-store',
          repoName: 'online-store',
          defaultBranch: 'master',
          repoUrl: 'https://github.com/org/pet-store-boston/online-store',
          organizationUrl: 'org/pet-store-boston',
        },
        ['org/pet-store-boston/pet-app']: {
          id: 'org/pet-store-boston/pet-app',
          repoName: 'pet-app',
          defaultBranch: 'master',
          repoUrl: 'https://github.com/org/pet-store-boston/pet-app',
          organizationUrl: 'org/pet-store-boston',
        },
      },
    );

    expect(Object.values(addedRepositories).length).toBe(7);
    expect(
      Object.keys(addedRepositories).find(
        r => r === 'org/pet-store-boston/pet-app',
      ),
    ).toBeTruthy();
    expect(
      Object.keys(addedRepositories).find(r => r === 'org/dessert/oreo'),
    ).toBeFalsy();
  });

  it('should return the url is the desired format', () => {
    let url = urlHelper('hjk');
    expect(url).toBe('hjk');
    url = urlHelper('https://hjkh');
    expect(url).toBe('hjkh');
    url = urlHelper('https://hjkh/hj');
    expect(url).toBe('hjkh/hj');
    url = urlHelper('');
    expect(url).toBe('-');
  });

  it('should update organization data when repositories are selected', () => {
    const newOrgsData = getNewOrgsData(
      {
        'org/dessert': {
          id: '1234',
          orgName: 'org/dessert',
          organizationUrl: 'https://github.com/org/dessert',
        },
        'org/food': {
          id: '1235',
          orgName: 'org/food',
          organizationUrl: 'https://github.com/org/food',
        },
        'org/pet-store-boston': {
          id: '1236',
          orgName: 'org/pet-store-boston',
          organizationUrl: 'https://github.com/org/pet-store-boston',
        },
      },
      mockGetRepositories.repositories[1],
    );
    expect(
      Object.values(newOrgsData).find(o => o.orgName === 'org/dessert')
        ?.selectedRepositories,
    ).toEqual({ 'org/dessert/donut': mockGetRepositories.repositories[1] });
  });

  it('should parse key-value pairs correctly with semicolons', () => {
    const prKeyValuePairInput = `argocd/app-name: 'guestbook'; github.com/project-slug: janus-idp/backstage-showcase; backstage.io/createdAt: '5/12/2021, 07:03:18 AM'; quay.io/repository-slug: janus-idp/backstage-showcase; backstage.io/kubernetes-id: test-backstage`;

    const expectedOutput = {
      'argocd/app-name': 'guestbook',
      'github.com/project-slug': 'janus-idp/backstage-showcase',
      'backstage.io/createdAt': '5/12/2021, 07:03:18 AM',
      'quay.io/repository-slug': 'janus-idp/backstage-showcase',
      'backstage.io/kubernetes-id': 'test-backstage',
    };

    expect(getYamlKeyValuePairs(prKeyValuePairInput)).toEqual(expectedOutput);
  });

  it('should handle empty input', () => {
    const prKeyValuePairInput = '';
    const expectedOutput = {};
    expect(getYamlKeyValuePairs(prKeyValuePairInput)).toEqual(expectedOutput);
  });

  it('should handle input without quotes', () => {
    const prKeyValuePairInput = `backstage.io/kubernetes-id: my-kubernetes-component`;

    const expectedOutput = {
      'backstage.io/kubernetes-id': 'my-kubernetes-component',
    };

    expect(getYamlKeyValuePairs(prKeyValuePairInput)).toEqual(expectedOutput);
  });

  it('should handle extra whitespace around key-value pairs', () => {
    const prKeyValuePairInput = ` argocd/app-name :  'guestbook' ; github.com/project-slug : janus-idp/backstage-showcase ; backstage.io/createdAt : '5/12/2021, 07:03:18 AM' `;

    const expectedOutput = {
      'argocd/app-name': 'guestbook',
      'github.com/project-slug': 'janus-idp/backstage-showcase',
      'backstage.io/createdAt': '5/12/2021, 07:03:18 AM',
    };

    expect(getYamlKeyValuePairs(prKeyValuePairInput)).toEqual(expectedOutput);
  });

  it('should parse key-value pairs correctly with semicolon in value', () => {
    const prKeyValuePairInput = `type: other; lifecycle: production; owner: user:guest`;

    const expectedOutput = {
      type: 'other',
      lifecycle: 'production',
      owner: 'user:guest',
    };

    expect(getYamlKeyValuePairs(prKeyValuePairInput)).toEqual(expectedOutput);
  });

  it('should evaluate job errors', () => {
    let createJobResponse: ImportJobResponse[] = [
      {
        errors: [],
        repository: mockGetRepositories.repositories[0],
        status: '' as RepositoryStatus,
      },
      {
        errors: [],
        repository: mockGetRepositories.repositories[1],
        status: '' as RepositoryStatus,
      },
    ];

    expect(getJobErrors(createJobResponse)).toEqual({
      errors: null,
      infos: null,
    });

    createJobResponse = [
      {
        errors: [],
        repository: mockGetRepositories.repositories[0],
        catalogEntityName: mockGetRepositories.repositories[0].name,
        status: '' as RepositoryStatus,
      },
      {
        errors: [RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO],
        repository: mockGetRepositories.repositories[1],
        catalogEntityName: mockGetRepositories.repositories[1].name,
        status: '' as RepositoryStatus,
      },
    ];
    expect(getJobErrors(createJobResponse)).toEqual({
      errors: {
        'org/dessert/donut': {
          repository: {
            name: mockGetRepositories.repositories[1].name,
            organization: mockGetRepositories.repositories[1].orgName,
          },
          catalogEntityName: mockGetRepositories.repositories[1].name,
          error: {
            message: [RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO],
          },
        },
      },
      infos: null,
    });

    createJobResponse = [
      {
        errors: [RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO],
        repository: mockGetRepositories.repositories[0],
        catalogEntityName: mockGetRepositories.repositories[0].name,
        status: '' as RepositoryStatus,
      },
      {
        errors: [RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO],
        repository: mockGetRepositories.repositories[1],
        catalogEntityName: mockGetRepositories.repositories[1].name,
        status: '' as RepositoryStatus,
      },
    ];
    expect(getJobErrors(createJobResponse)).toEqual({
      errors: {
        'org/dessert/donut': {
          repository: {
            name: mockGetRepositories.repositories[1].name,
            organization: mockGetRepositories.repositories[1].orgName,
          },
          catalogEntityName: mockGetRepositories.repositories[1].name,
          error: {
            message: [RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO],
          },
        },
      },
      infos: {
        'org/dessert/cupcake': {
          repository: {
            name: mockGetRepositories.repositories[0].name,
            organization: mockGetRepositories.repositories[0].orgName,
          },
          catalogEntityName: mockGetRepositories.repositories[0].name,
          error: {
            message: [RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO],
          },
        },
      },
    });
  });
});
