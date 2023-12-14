import React from 'react';

import { LinkProps } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';

import {
  taskRunWithResults,
  taskRunWithSBOMResult,
  taskRunWithSBOMResultExternalLink,
} from '../../../__fixtures__/taskRunData';
import PipelineRunSBOMLink from '../PipelineRunSBOMLink';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Link: (props: LinkProps) => (
      <a href={props.to} data-test={props.to}>
        {props.children}
      </a>
    ),
  };
});

describe('PipelineRunSBOMLInk', () => {
  it('should render the icon space holder', () => {
    render(<PipelineRunSBOMLink sbomTaskRun={undefined} />);

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the icon space holder if the taskrun passed is not a valid sbomTaskrun', () => {
    render(<PipelineRunSBOMLink sbomTaskRun={taskRunWithResults} />);

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the internal logs link for a sbom Taskrun', () => {
    render(<PipelineRunSBOMLink sbomTaskRun={taskRunWithSBOMResult} />);
    expect(screen.queryByTestId('internal-sbom-link')).toBeInTheDocument();
  });

  it('should render the external logs link for a sbom Taskrun', () => {
    render(
      <PipelineRunSBOMLink sbomTaskRun={taskRunWithSBOMResultExternalLink} />,
    );

    expect(screen.queryByTestId('external-sbom-link')).toBeInTheDocument();
  });
});
