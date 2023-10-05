import React from 'react';

import { render, screen } from '@testing-library/react';

import { ArtifactRowData, ArtifactTable } from './ArtifactTable';

describe('ArtifactTable', () => {
  const sampleRows: ArtifactRowData[] = [
    {
      version: '1.0.0',
      artifact: 'test-artifact',
      assetVariants: new Set(['test-variant']),
      repositoryType: 'test-repo',
      hash: {
        algorithm: 'sha256',
        value: 'sha256-test-hash',
      },
      lastModified: 'Sep 26, 2023, 10:35 PM',
      sizeBytes: 130000,
    },
    {
      version: '1.0.1',
      artifact: 'test-artifact',
      assetVariants: new Set(),
      repositoryType: 'test-repo',
      hash: {
        algorithm: 'sha1',
        value: 'test-hash-sha1',
      },
      lastModified: 'Sep 29, 2023, 10:35 PM',
      sizeBytes: 130000,
    },
  ];

  it('renders rows', async () => {
    await render(
      <ArtifactTable title="Nexus Artifacts" artifacts={sampleRows} />,
    );

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('test-variant')).toBeInTheDocument();
    expect(screen.getByText('sha256')).toBeInTheDocument();
    // Not full hash, just first 12 chars
    expect(screen.getByText('sha256-test-')).toBeInTheDocument();
    expect(screen.getByText('Sep 26, 2023, 10:35 PM')).toBeInTheDocument();

    expect(screen.getAllByText('test-artifact')).toHaveLength(2);
    expect(screen.getAllByText('test-repo')).toHaveLength(2);
  });

  it('renders empty state', async () => {
    const { queryByTestId } = await render(
      <ArtifactTable title="Nexus Artifacts" artifacts={[]} />,
    );

    expect(
      queryByTestId('nexus-repository-manager-empty-table'),
    ).not.toBeNull();
    expect(screen.getByText(/No data was added yet/)).toBeInTheDocument();
  });

  it('renders N/A for undefined hashes', async () => {
    const noHash = {
      ...sampleRows[0],
      hash: undefined,
    };

    await render(
      <ArtifactTable title="Nexus Artifacts" artifacts={[noHash]} />,
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
