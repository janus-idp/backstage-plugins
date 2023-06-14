import React from 'react';

import { render } from '@testing-library/react';

import abortedCluster from '../../../__fixtures__/aborted-cluster.json';
import clusterOne from '../../../__fixtures__/cluster1.json';
import { useCluster } from '../ClusterContext';
import { ClusterAvailableResourceCard } from './ClusterAvailableResourcesCard';

jest.mock('../ClusterContext/', () => ({
  useCluster: jest.fn().mockReturnValue({}),
}));

describe('ClusterAvailableResourceCard', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the table', () => {
    (useCluster as jest.Mock).mockReturnValue({ data: clusterOne });
    const { getByText } = render(<ClusterAvailableResourceCard />);

    expect(getByText('96')).toBeInTheDocument();
    expect(getByText('503 Gi')).toBeInTheDocument();
    expect(getByText('750')).toBeInTheDocument();
  });

  it('should render nothing when there is no cluster data', () => {
    (useCluster as jest.Mock).mockReturnValue({});
    const { queryByText } = render(<ClusterAvailableResourceCard />);

    expect(queryByText('96')).toBeNull();
    expect(queryByText('503 Gi')).toBeNull();
    expect(queryByText('750')).toBeNull();
  });

  it('should render nothing when available resources are missing', () => {
    (useCluster as jest.Mock).mockReturnValue({ data: abortedCluster });
    const { queryByText } = render(<ClusterAvailableResourceCard />);

    expect(queryByText('96')).toBeNull();
    expect(queryByText('503 Gi')).toBeNull();
    expect(queryByText('750')).toBeNull();
  });
});
