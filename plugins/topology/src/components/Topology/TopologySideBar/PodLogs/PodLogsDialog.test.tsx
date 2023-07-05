import React, { useContext } from 'react';

import { V1Pod } from '@kubernetes/client-node';
import { render } from '@testing-library/react';

import { mockKubernetesResponse } from '../../../../__fixtures__/1-deployments';
import { PodLogsDialog } from './PodLogsDialog';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      titleContainer: 'title',
      closeButton: 'close',
    };
  },
  Dialog: () => <div data-testid="dialog" />,
}));

describe('PodLogsDialog', () => {
  it('should show Dialog & View logs', () => {
    (useContext as jest.Mock).mockReturnValue({
      clusters: ['OCP'],
      selectedCluster: [0],
    });
    const { queryByText, queryByTestId } = render(
      <PodLogsDialog podData={mockKubernetesResponse.pods[0] as V1Pod} />,
    );
    expect(queryByText(/View Logs/i)).toBeInTheDocument();
    expect(queryByTestId('dialog')).toBeInTheDocument();
  });

  it('should not show Dialog & View logs', () => {
    (useContext as jest.Mock).mockReturnValue({
      clusters: [],
    });
    const { queryByText, queryByTestId } = render(
      <PodLogsDialog podData={mockKubernetesResponse.pods[0] as V1Pod} />,
    );
    expect(queryByText(/View Logs/i)).not.toBeInTheDocument();
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
