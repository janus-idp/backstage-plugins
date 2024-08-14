import React from 'react';
import ReactJson from 'react-json-view';

import { useTheme } from '@material-ui/core';

import { Paragraph } from './Paragraph';

interface ProcessVariablesViewerProps {
  variables?: object;
  emptyState?: React.ReactNode;
}

export const WorkflowVariablesViewer: React.FC<ProcessVariablesViewerProps> = ({
  variables = {},
  emptyState = <Paragraph>No data available</Paragraph>,
}) => {
  const theme = useTheme();

  return !variables ? (
    <>{emptyState}</>
  ) : (
    <ReactJson
      src={variables}
      name={false}
      theme={theme.palette.type === 'dark' ? 'monokai' : 'rjv-default'}
    />
  );
};
WorkflowVariablesViewer.displayName = 'WorkflowVariablesViewer';
