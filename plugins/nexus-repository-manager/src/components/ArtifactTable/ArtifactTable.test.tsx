import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
      sizeBytes: 140000,
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

  it('sorts by size correctly', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'smaller',
        sizeBytes: 100,
      },
      {
        ...sampleRows[0],
        version: 'larger',
        sizeBytes: 200,
      },
    ];
    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Size');

    await user.click(header);
    let rows = table.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('smaller');

    await user.click(header);
    rows = table.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('larger');
  });

  it('sorts by checksum correctly', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        version: 'smaller',
        hash: {
          algorithm: 'sha256' as const,
          value: 'a',
        },
      },
      {
        ...sampleRows[0],
        version: 'larger',
        hash: {
          algorithm: 'sha1' as const,
          value: 'b',
        },
      },
      {
        ...sampleRows[0],
        version: 'larger2',
        hash: {
          algorithm: 'sha1' as const,
          value: 'b',
        },
      },
      {
        ...sampleRows[0],
        version: 'unset',
        hash: undefined,
      },
    ];
    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    const header = screen.getByText('Checksum');

    await user.click(header);
    let rows = table.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('unset');
    expect(rows[1]).toHaveTextContent('smaller');
    expect(rows[2]).toHaveTextContent('larger');
    expect(rows[3]).toHaveTextContent('larger');

    await user.click(header);
    rows = table.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('larger');
    expect(rows[1]).toHaveTextContent('larger');
    expect(rows[2]).toHaveTextContent('smaller');
    expect(rows[3]).toHaveTextContent('unset');
  });

  it('filters by checksum', async () => {
    const rowData = [
      {
        ...sampleRows[0],
        hash: {
          algorithm: 'sha1' as const,
          value: 'first-hash',
        },
      },
      {
        ...sampleRows[0],
        hash: {
          algorithm: 'sha1' as const,
          value: 'second-hash',
        },
      },
      {
        ...sampleRows[0],
        hash: {
          algorithm: 'sha1' as const,
          value: 'something-else',
        },
      },
      {
        ...sampleRows[0],
        hash: undefined,
      },
    ];
    await render(<ArtifactTable title="Nexus Artifacts" artifacts={rowData} />);

    const user = userEvent.setup();
    const table = screen.getAllByRole('table')[0];
    let rows;

    const filterInput = screen.getByPlaceholderText('Filter');
    await user.type(filterInput, '-hash');
    await waitFor(() => {
      rows = table.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveTextContent('-hash');
      expect(rows[1]).toHaveTextContent('-hash');
      expect(rows[2].textContent).toBe('');
    });

    await user.clear(filterInput);
    await user.type(filterInput, 'something');
    await waitFor(() => {
      rows = table.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveTextContent('something-');
      expect(rows[1].textContent).toBe('');
    });

    await user.clear(filterInput);
    await user.type(filterInput, 'nothing-that-exists');
    await waitFor(() => {
      rows = table.querySelectorAll('tbody tr');
      expect(rows[0].textContent).toBe('No records to display');
    });
  });
});
