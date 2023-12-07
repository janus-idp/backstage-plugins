import React from 'react';

import { LinkProps } from '@backstage/core-components';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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
    render(<PipelineRunSBOMLink sbomTaskRun={undefined} onClick={() => {}} />);

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the icon space holder if the taskrun passed is not a valid sbomTaskrun', () => {
    render(
      <PipelineRunSBOMLink
        sbomTaskRun={taskRunWithResults}
        onClick={() => {}}
      />,
    );

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the internal logs link for a sbom Taskrun', () => {
    render(
      <PipelineRunSBOMLink
        sbomTaskRun={taskRunWithSBOMResult}
        onClick={() => {}}
      />,
    );
    expect(screen.queryByTestId('internal-sbom-link')).toBeInTheDocument();
  });

  it('should render the external logs link for a sbom Taskrun', () => {
    render(
      <PipelineRunSBOMLink
        sbomTaskRun={taskRunWithSBOMResultExternalLink}
        onClick={() => {}}
      />,
    );

    expect(screen.queryByTestId('external-sbom-link')).toBeInTheDocument();
  });

  it('should open the internal logs link for a sbom Taskrun', async () => {
    const openLogs = jest.fn();
    const { getByTestId } = render(
      <PipelineRunSBOMLink
        sbomTaskRun={taskRunWithSBOMResult}
        onClick={openLogs}
      />,
    );

    fireEvent.click(getByTestId('internal-sbom-link'));
    await waitFor(() => expect(openLogs).toHaveBeenCalled());
  });

  it('should open the internal logs if the sbom Task link is not a valid url', async () => {
    const openLogs = jest.fn();

    const taskRunWithInvalidExternalSBOMLink = {
      ...taskRunWithSBOMResult,
      status: {
        ...taskRunWithSBOMResult,
        results: [
          {
            name: 'LINK_TO_SBOM',
            type: 'string',
            value: 'https://quay.io/test/image:build-8e536-1692702836',
          },
        ],
      },
    };

    const { getByTestId } = render(
      <PipelineRunSBOMLink
        sbomTaskRun={taskRunWithInvalidExternalSBOMLink}
        onClick={openLogs}
      />,
    );

    fireEvent.click(getByTestId('internal-sbom-link'));
    await waitFor(() => expect(openLogs).toHaveBeenCalled());
  });
});
