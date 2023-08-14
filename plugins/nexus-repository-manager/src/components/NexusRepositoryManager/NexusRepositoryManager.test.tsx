import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAsync } from 'react-use';

import { render } from '@testing-library/react';

import { NexusRepositoryManager } from './NexusRepositoryManager';

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest
    .fn()
    .mockReturnValue({ error: null, loading: false, value: [] }),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getComponents: jest.fn().mockReturnValue({ components: [] }),
    getAnnotations: jest.fn().mockReturnValue({ ANNOTATIONS: [] }),
  }),
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: jest.fn().mockReturnValue({ entity: {} }),
}));

jest.mock('../../hooks/', () => ({
  ...jest.requireActual('../../hooks/'),
  useNexusRepositoryManagerAppData: jest
    .fn()
    .mockReturnValue({ title: '', query: {} }),
}));

describe('NexusRepositoryManager', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should show progress if loading is true', () => {
    (useAsync as jest.Mock).mockReturnValue({ loading: true, value: [] });
    const { getByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(getByTestId('nexus-repository-manager-loading')).not.toBeNull();
  });

  it('should show empty table if loaded and value is not present', () => {
    (useAsync as jest.Mock).mockReturnValue({ loading: false, value: [] });
    const { getByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(getByTestId('nexus-repository-manager-table')).not.toBeNull();
    expect(getByTestId('nexus-repository-manager-empty-table')).not.toBeNull();
  });

  it('should show table if loaded and value is present', () => {
    (useAsync as jest.Mock).mockReturnValue({
      loading: false,
      value: [
        {
          component: {
            id: 'ZG9ja2VyOjdmMDZjOGViMzQ2N2JkOWEyNWY0OTUwOWY4ODYxNWFh',
            repository: 'docker',
            format: 'docker',
            group: null,
            name: 'janus-idp/backstage-showcase',
            version: 'latest',
            assets: [
              {
                downloadUrl:
                  'http://localhost:8081/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest',
                path: 'v2/janus-idp/backstage-showcase/manifests/latest',
                id: 'ZG9ja2VyOmE3NjI4NGQzYzVlYjI1MTg0ODBhNmM1MDllN2UyYzE5',
                repository: 'docker',
                format: 'docker',
                checksum: {
                  sha1: '206f5cfc76a16dbba78e2b9a826cbe7bd5cdd7dd',
                  sha256:
                    '85aa455189b4dba87108d57ec3b223b1766e15c16cb03b046a17bdfcddb37cc3',
                },
                contentType:
                  'application/vnd.docker.distribution.manifest.v2+json',
                lastModified: '2023-07-27T21:34:40.249+00:00',
                lastDownloaded: '2023-08-07T17:47:19.273+00:00',
                uploader: 'admin',
                uploaderIp: '0.0.0.0',
                fileSize: 1586,
              },
            ],
          },
          rawAssets: [
            {
              schemaVersion: 2,
              mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
              config: {
                mediaType: 'application/vnd.docker.container.image.v1+json',
                size: 17214,
                digest:
                  'sha256:7779fcf4e4a18239961a620c36329b646da17abb70d3e4af2d67a2d3b27695c9',
              },
              layers: [
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 36581161,
                  digest:
                    'sha256:7890eb22610600843a22de84c96fab3f2d428d19e164a529d775ebbb22cc2f3e',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 36267603,
                  digest:
                    'sha256:cfdca8bd8795bb3e2c17030868e88434c52d55b7727a10187c9c0b7d0884daf0',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 34035582,
                  digest:
                    'sha256:8b819f6efa3a8cd38f30259971941291a36fa6472a83ae6bf9bc79119d0e4c87',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 32,
                  digest:
                    'sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 132701544,
                  digest:
                    'sha256:ee443150ae3adcf4f259a86940e6095cd661cad1c31774d198f5d8f85adfd28d',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 132772515,
                  digest:
                    'sha256:0fc00d970ac8cb78ca3040c28de02350f68f2eeb4d30c211d94aa06f1b093460',
                },
              ],
            },
          ],
        },
      ],
    });
    const { queryByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(queryByTestId('nexus-repository-manager-table')).not.toBeNull();
    expect(queryByTestId('nexus-repository-manager-empty-table')).toBeNull();
  });
});
