import React from 'react';
import { render } from '@testing-library/react';
import {
  wrapInTestApp,
} from "@backstage/test-utils";
import { CollapsibleTable } from './CollapsibleTable';
import * as pipelineRunFileMock from './__fixtures__/pipelinerun.json';

jest.mock('../../hooks/usePipelineRunObjects')

describe('CollapsibleTable', () => {
  it('should render a pipelinerun', async () => {
    const { getByText } = render(
      wrapInTestApp(<CollapsibleTable pipelineruns={[pipelineRunFileMock as any]}/>),
    );
    expect(getByText('feature-added-catalog-info-xdjk9')).toBeInTheDocument();
  });
  
});
