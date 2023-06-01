import React from 'react';

import { BaseNode } from '@patternfly/react-topology';
import { render } from '@testing-library/react';

import {
  workloadNode,
  workloadNode2,
  workloadNode3,
  workloadNode4,
} from '../../../__fixtures__/workloadNodeData';
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

  it('Should show jobs section only for cron-job', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('job-list')).toBeNull();
  });

  it('Should show jobs if available for cron-job and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode3 as BaseNode} />,
    );
    expect(queryByTestId('job-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode4 as BaseNode} />);
    getByText(/no jobs found for this resource/i);
  });

  it('Should show routes only if available otherwise should not show it', () => {
    const { queryByTestId, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('routes-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    expect(queryByTestId('routes-list')).toBeNull();
  });

  it('Should show routes and ingresses both if available', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('routes-list')).not.toBeNull();
    expect(queryByTestId('ingress-list')).not.toBeNull();
  });

  it('Should show empty state for ingresses if none of routes and ingresses are associated', () => {
    const { queryByTestId, getByText } = render(
      <TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />,
    );
    expect(queryByTestId('routes-list')).toBeNull();
    expect(queryByTestId('ingress-list')).not.toBeNull();
    getByText(/no ingresses found for this resource/i);
  });
});
