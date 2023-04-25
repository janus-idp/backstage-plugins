import React from 'react';
import { render } from '@testing-library/react';
import {
  workloadNode,
  workloadNode2,
} from '../../../__fixtures__/workloadNodeData';
import { BaseNode } from '@patternfly/react-topology';
import TopologyResourcesTabPanel from './TopologyResourcesTabPanel';

describe('TopologyResourcesTabPanel', () => {
  it('Should render workload resources', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('resources-tab')).not.toBeNull();
  });

  it('Should show pods if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('pod-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no pods found for this resource/i);
  });

  it('Should show services if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('service-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no services found for this resource/i);
  });

  it('Should show ingresses if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('ingress-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no ingresses found for this resource/i);
  });
});
