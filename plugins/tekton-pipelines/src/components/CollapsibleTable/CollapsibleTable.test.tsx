import React from 'react';
import { render } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { CollapsibleTable } from './CollapsibleTable';
import * as pipelineRunFileMock from './__fixtures__/pipelinerun.json';

describe('CollapsibleTable', () => {
  it('should render a pipelinerun', async () => {
    const { getByText, debug } = render(
      wrapInTestApp(
        <CollapsibleTable pipelineruns={[pipelineRunFileMock as any]} />,
      ),
    );
    debug();
    expect(getByText('feature-added-catalog-info-xdjk9')).toBeInTheDocument();
  });
});
