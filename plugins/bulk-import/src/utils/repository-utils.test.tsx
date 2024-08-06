import { getDataForRepositories, mockData } from '../mocks/mockData';
import {
  createOrganizationData,
  getNewOrgsData,
  getSelectedRepositories,
  getSelectedRepositoriesCount,
  getYamlKeyValuePairs,
  updateWithNewSelectedRepositories,
  urlHelper,
} from './repository-utils';

describe('Repository utils', () => {
  it('should allow users to select repositories if none are selected yet', () => {
    const component = getSelectedRepositoriesCount(
      jest.fn(),
      { id: 1, selectedRepositories: [] },
      0,
    );
    expect(component.props['data-testid']).toBe('select-repositories');
  });

  it('should allow users to edit repositories if repositories are selected', () => {
    const component = getSelectedRepositoriesCount(
      jest.fn(),
      {
        id: 1,
        selectedRepositories: [{ id: 1, repoName: 'xyz' }],
        repositories: [
          { id: 1, repoName: 'xyz' },
          { id: 2, repoName: 'abc' },
        ],
      },
      0,
    );
    expect(component.props['data-testid']).toBe('edit-repositories');
  });

  it('should evaluate the newly selected repositories in the organization drawer', () => {
    let addedRepositories = updateWithNewSelectedRepositories(
      getDataForRepositories('user:default/guest'),
      {
        Cupcake: mockData('use:default/guest')[0],
      },
      [1, 2],
    );

    expect(Object.values(addedRepositories).length).toBe(2);
    expect(
      Object.keys(addedRepositories).find(r => r === 'Donut'),
    ).toBeTruthy();

    addedRepositories = updateWithNewSelectedRepositories(
      getDataForRepositories('user:default/guest'),
      {
        Cupcake: mockData('use:default/guest')[0],
      },
      [2],
    );

    expect(Object.values(addedRepositories).length).toBe(1);
    expect(
      Object.keys(addedRepositories).find(r => r === 'Donut'),
    ).toBeTruthy();
    expect(
      Object.keys(addedRepositories).find(r => r === 'Cupcake'),
    ).toBeFalsy();
  });

  it('should evaluate the selected repositories', () => {
    let orgData = {
      id: 1,
      orgName: 'org/desert',
      organizationUrl: 'org/desert',
      repositories: mockData('user:default/guest'),
      selectedRepositories: mockData('user:default/guest').slice(0, 2),
    };
    let selectedRepositories = getSelectedRepositories(orgData, [1, 2, 3]);
    expect(selectedRepositories.length).toBe(3);
    expect(selectedRepositories).toEqual(
      mockData('user:default/guest').slice(0, 3),
    );

    orgData = {
      id: 1,
      orgName: 'org/desert',
      organizationUrl: 'org/desert',
      repositories: mockData('user:default/guest'),
      selectedRepositories: mockData('user:default/guest').slice(0, 2),
    };
    selectedRepositories = getSelectedRepositories(orgData, [3, 4]);
    expect(selectedRepositories.length).toBe(2);
    expect(selectedRepositories).toEqual(
      mockData('user:default/guest').slice(2, 4),
    );
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
      createOrganizationData(mockData('user:default/guest')).slice(0, 5),
      getDataForRepositories('user:default/guest').slice(0, 4),
      [2, 3],
      3,
    );
    expect(newOrgsData.find(o => o.id === 1)?.selectedRepositories).toEqual(
      getDataForRepositories('user:default/guest').slice(1, 3),
    );
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
});
