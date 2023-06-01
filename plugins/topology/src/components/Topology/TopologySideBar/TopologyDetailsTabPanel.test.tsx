import React from 'react';

import { BaseNode } from '@patternfly/react-topology';
import { render } from '@testing-library/react';

import { workloadNode, workloadNode2 } from '../../../__fixtures__/workloadNodeData';
import TopologyDetailsTabPanel from './TopologyDetailsTabPanel';

describe('TopologyDetailsTabPanel', () => {
  it('Should render workload node details', () => {
    const { queryByTestId } = render(<TopologyDetailsTabPanel node={workloadNode as BaseNode} />);
    expect(queryByTestId('details-tab')).not.toBeNull();
  });

  it('Should show pod ring if pods data is available', () => {
    const { rerender, queryByRole } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(
      queryByRole('img', {
        name: /1 pod/i,
      }),
    ).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    expect(
      queryByRole('img', {
        name: /1 pods/i,
      }),
    ).toBeNull();
  });

  it('Should show labels if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('label-list')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no labels/i);
  });

  it('Should show annotations if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('annotation-list')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no annotations/i);
  });

  it('Should show owners if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('owner-list')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no owner/i);
  });

  it('Should show more details if workload is a deployment', () => {
    const { queryByTestId, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('deployment-details')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    expect(queryByTestId('deployment-details')).toBeNull();
  });
});
