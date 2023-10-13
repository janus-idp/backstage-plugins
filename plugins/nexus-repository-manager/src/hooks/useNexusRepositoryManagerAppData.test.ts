import { renderHook } from '@testing-library/react-hooks';

import { NEXUS_REPOSITORY_MANAGER_ANNOTATIONS } from '../annotations';
import { useNexusRepositoryManagerAppData } from './useNexusRepositoryManagerAppData';

describe('useNexusRepositoryManagerAppData', () => {
  it('should require annotations', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name':
                'janus-idp/backstage-showcase',
            },
          },
        },
        ANNOTATIONS: [],
      }),
    );

    expect(() => {
      expect(result.current).not.toBe(undefined);
    }).toThrow(
      Error('A Nexus Repository Manager annotation could not be found'),
    );
  });

  it('should require an entity with an annotation', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(() => {
      expect(result.current).not.toBe(undefined);
    }).toThrow(
      Error('A Nexus Repository Manager annotation could not be found'),
    );
  });

  it('should return title and query', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name':
                'janus-idp/backstage-showcase',
            },
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(result.current).toEqual({
      title: 'janus-idp/backstage-showcase',
      query: {
        dockerImageName: 'janus-idp/backstage-showcase',
        sort: 'version',
      },
    });
  });

  it('should return title and query with multiple repositories', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name': 'janus-idp',
              'nexus-repository-manager/docker.image-tag': 'latest',
            },
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(result.current).toEqual({
      title: 'janus-idp | latest',
      query: {
        dockerImageName: 'janus-idp',
        dockerImageTag: 'latest',
        sort: 'version',
      },
    });
  });

  it('should have a custom title', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name':
                'janus-idp/backstage-showcase',
              'nexus-repository-manager/config.title': 'Custom Title',
            },
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(result.current).toEqual({
      title: 'Custom Title',
      query: {
        dockerImageName: 'janus-idp/backstage-showcase',
        sort: 'version',
      },
    });
  });
});
