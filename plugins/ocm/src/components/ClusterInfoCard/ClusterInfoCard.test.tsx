import React from 'react';

import { render } from '@testing-library/react';

import data from '../../../__fixtures__/cluster1.json';
import { useCluster } from '../ClusterContext';
import { ClusterInfoCard } from './ClusterInfoCard';

jest.mock('../ClusterContext/', () => ({
  useCluster: jest.fn().mockReturnValue({}),
}));

jest.mock('../common', () => ({
  Status: () => 'Ready',
  Update: () => '4.10.26',
}));

describe('ClusterInfoCard', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the table', () => {
    (useCluster as jest.Mock).mockReturnValue({ data: data });
    const { getByText } = render(<ClusterInfoCard />);

    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('Ready')).toBeInTheDocument();
    expect(getByText('v1.23.5+012e945')).toBeInTheDocument();
    expect(
      getByText('91976abd-8b8e-47b9-82d3-e84793396ed7'),
    ).toBeInTheDocument();
    expect(getByText('4.10.26')).toBeInTheDocument();
    expect(getByText('BareMetal')).toBeInTheDocument();
  });

  it('should render nothing when there is no cluster data', () => {
    (useCluster as jest.Mock).mockReturnValue({});
    const { queryByText } = render(<ClusterInfoCard />);

    expect(queryByText('foo')).toBeNull();
    expect(queryByText('Ready')).toBeNull();
    expect(queryByText('v1.23.5+012e945')).toBeNull();
    expect(queryByText('91976abd-8b8e-47b9-82d3-e84793396ed7')).toBeNull();
    expect(queryByText('4.10.26')).toBeNull();
    expect(queryByText('BareMetal')).toBeNull();
  });
});
