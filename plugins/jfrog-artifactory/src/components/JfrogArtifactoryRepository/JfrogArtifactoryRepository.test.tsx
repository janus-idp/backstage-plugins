import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { JfrogArtifactoryRepository } from './JfrogArtifactoryRepository';
import { jfrogArtifactoryApiRef } from '../../api/artifactoryApi';
import { TestApiProvider } from '@backstage/test-utils';
import { PackageResponse, PackageEdge } from '../../types';

// Mock data and function
const mockGetArtifact = jest.fn();
const mockPackageEdge: PackageEdge = {
  node: {
    name: 'Test package',
    description: 'Test description',
    created: '2023-06-02',
    versions: [
      {
        name: '1.0.0',
        size: '1000',
        repos: [{ name: 'Test repo' }],
        vulnerabilities: {
          high: 1,
          medium: 0,
          low: 0,
          info: 0,
          unknown: 0,
          skipped: 0,
        },
        stats: { downloadCount: 100 },
        package: { packageType: 'npm' },
      },
    ],
  },
};
const mockArtifactResponse: PackageResponse = {
  data: {
    packages: {
      edges: [mockPackageEdge],
    },
  },
};

// Mock data for multiple repositories
const mockPackageEdgeWithMultipleRepos: PackageEdge = {
  ...mockPackageEdge,
  node: {
    ...mockPackageEdge.node,
    versions: [
      {
        ...mockPackageEdge.node.versions[0],
        repos: [{ name: 'Repo1' }, { name: 'Repo2' }],
      },
    ],
  },
};

const mockArtifactResponseWithMultipleRepos: PackageResponse = {
  data: {
    packages: {
      edges: [mockPackageEdgeWithMultipleRepos],
    },
  },
};

const mockPackageEdgeWithEmptyRepos: PackageEdge = {
  ...mockPackageEdge,
  node: {
    ...mockPackageEdge.node,
    versions: [
      {
        ...mockPackageEdge.node.versions[0],
        repos: [],
      },
    ],
  },
};

const mockArtifactResponseWithEmptyRepos: PackageResponse = {
  data: {
    packages: {
      edges: [mockPackageEdgeWithEmptyRepos],
    },
  },
};

describe('JfrogArtifactoryRepository', () => {
  it('fetches data from the API and renders it in the table', async () => {
    mockGetArtifact.mockResolvedValue(mockArtifactResponse);

    render(
      <TestApiProvider
        apis={[[jfrogArtifactoryApiRef, { getArtifact: mockGetArtifact }]]}
      >
        <JfrogArtifactoryRepository
          widget={false}
          artifact="artifact1"
          title="Artifacts"
        />
      </TestApiProvider>,
    );

    await waitFor(() =>
      expect(mockGetArtifact).toHaveBeenCalledWith('artifact1'),
    );

    // Check the rendering of fetched data
    expect(screen.getByText('Test package')).toBeInTheDocument();
  });

  it('displays "N/A" when repos are empty', async () => {
    mockGetArtifact.mockResolvedValue(mockArtifactResponseWithEmptyRepos);

    render(
      <TestApiProvider
        apis={[[jfrogArtifactoryApiRef, { getArtifact: mockGetArtifact }]]}
      >
        <JfrogArtifactoryRepository
          widget={false}
          artifact="artifact1"
          title="Artifacts"
        />
      </TestApiProvider>,
    );

    await waitFor(() =>
      expect(mockGetArtifact).toHaveBeenCalledWith('artifact1'),
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('joins multiple repo names with a comma', async () => {
    mockGetArtifact.mockResolvedValue(mockArtifactResponseWithMultipleRepos);

    render(
      <TestApiProvider
        apis={[[jfrogArtifactoryApiRef, { getArtifact: mockGetArtifact }]]}
      >
        <JfrogArtifactoryRepository
          widget={false}
          artifact="artifact1"
          title="Artifacts"
        />
      </TestApiProvider>,
    );

    await waitFor(() =>
      expect(mockGetArtifact).toHaveBeenCalledWith('artifact1'),
    );

    expect(screen.getByText('Repo1, Repo2')).toBeInTheDocument();
  });

  it('displays "N/A" when repos are undefined', async () => {
    mockGetArtifact.mockResolvedValue(mockArtifactResponseWithEmptyRepos);

    render(
      <TestApiProvider
        apis={[[jfrogArtifactoryApiRef, { getArtifact: mockGetArtifact }]]}
      >
        <JfrogArtifactoryRepository
          widget={false}
          artifact="artifact1"
          title="Artifacts"
        />
      </TestApiProvider>,
    );

    await waitFor(() =>
      expect(mockGetArtifact).toHaveBeenCalledWith('artifact1'),
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
