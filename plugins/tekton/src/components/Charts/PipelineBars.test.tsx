import React from 'react';

import { render } from '@testing-library/react';

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import PipelineBars from './PipelineBars';

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

describe('PipelineBars', () => {
  it('should show PipelineBars & Dialog', () => {
    (React.useContext as jest.Mock).mockReturnValue({
      clusters: ['OCP'],
      selectedCluster: [0],
      watchResourcesData: {
        pods: { data: mockKubernetesPlrResponse.pods },
        taskruns: { data: mockKubernetesPlrResponse.taskruns },
      },
    });
    const pipelineRun = mockKubernetesPlrResponse.pipelineruns[0];
    const { queryByTestId } = render(
      <PipelineBars pipelineRun={pipelineRun} />,
    );
    expect(
      queryByTestId(`horizontal-stacked-bars-${pipelineRun.metadata.name}`),
    ).toBeInTheDocument();
    expect(queryByTestId('dialog')).toBeInTheDocument();
  });
});
