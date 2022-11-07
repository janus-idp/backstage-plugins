import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  wrapInTestApp,
} from "@backstage/test-utils";
import { TektonDashboardComponent } from './TektonDashboardComponent';
import { usePipelineRunObjects } from '../../hooks/usePipelineRunObjects';

jest.mock('../../hooks/usePipelineRunObjects')

describe('TektonDashboardComponent', () => {
  it('render empty response', async () => {
    (usePipelineRunObjects as any).mockReturnValue({
      pipelineRunObjects: {
        pipelineRuns: [],
      },
      error: undefined,
    });
    await waitFor(() => {
    const { getByText } = render(
      wrapInTestApp(
        <TektonDashboardComponent
        entity={
          {
            metadata: {
              name: 'some-entity',
            },
          } as any
        }
        />,
      ),
    );
   
    expect(getByText('PipelineRuns')).toBeInTheDocument();
  });

  });  
  
});
