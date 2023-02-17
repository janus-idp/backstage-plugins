import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { CollapsibleTable } from './CollapsibleTable';
import * as pipelineRunFileMock from './__fixtures__/pipelinerun.json';

describe('CollapsibleTable', () => {
  it('should render a pipelinerun', async () => {
    const { getByText, debug } = render(
      wrapInTestApp(
        <CollapsibleTable
          clusterName="Cluster1"
          pipelineruns={[pipelineRunFileMock as any]}
        />,
      ),
    );

    await waitFor(() => {
      debug();
    });

    expect(getByText('feature-added-catalog-info-xdjk9')).toBeInTheDocument();
  });
});
