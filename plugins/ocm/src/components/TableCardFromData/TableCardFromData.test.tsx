import React from 'react';

import { render } from '@testing-library/react';

import data from '../../../__fixtures__/cluster1.json';
import { TableCardFromData } from './TableCardFromData';

describe('TableCardFromData', () => {
  it('should render the cluster info', () => {
    const clusterInfoNameMap = new Map<string, string>([
      ['name', 'Name'],
      ['kubernetesVersion', 'Kubernetes version'],
      ['openshiftId', 'OpenShift ID'],
      ['openshiftVersion', 'OpenShift version'],
      ['platform', 'Platform'],
    ]);

    const { getByText } = render(
      <TableCardFromData
        data={data}
        title="Cluster Info"
        nameMap={clusterInfoNameMap}
      />,
    );

    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('v1.23.5+012e945')).toBeInTheDocument();
    expect(
      getByText('91976abd-8b8e-47b9-82d3-e84793396ed7'),
    ).toBeInTheDocument();
    expect(getByText('4.10.26')).toBeInTheDocument();
    expect(getByText('BareMetal')).toBeInTheDocument();
  });

  it('should render the available resources', () => {
    const availableNameMap = new Map<string, string>([
      ['cpuCores', 'CPU cores'],
      ['memorySize', 'Memory size'],
      ['numberOfPods', 'Number of pods'],
    ]);

    const { getByText } = render(
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={availableNameMap}
      />,
    );

    expect(getByText('96')).toBeInTheDocument();
    expect(getByText('503 Gi')).toBeInTheDocument();
    expect(getByText('750')).toBeInTheDocument();
  });

  it('should render nothing if there is an empty name map', () => {
    const availableNameMap = new Map<string, string>([]);

    const { queryByText } = render(
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={availableNameMap}
      />,
    );

    expect(queryByText('96')).toBeNull();
    expect(queryByText('503 Gi')).toBeNull();
    expect(queryByText('750')).toBeNull();
  });

  it('should ignore unknown keys in name map', () => {
    const availableNameMap = new Map<string, string>([
      ['cpuCores', 'CPU cores'],
      ['memorySize', 'Memory size'],
      ['numberOfProds', 'Number of prods'],
    ]);

    const { queryByText } = render(
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={availableNameMap}
      />,
    );

    expect(queryByText('96')).toBeInTheDocument();
    expect(queryByText('503 Gi')).toBeInTheDocument();
    expect(queryByText('Number of prods')).toBeNull();
  });
});
