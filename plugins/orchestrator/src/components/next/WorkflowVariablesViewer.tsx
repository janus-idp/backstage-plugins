import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';

import { useTheme } from '@material-ui/core';

import { Paragraph } from '../Paragraph/Paragraph';

interface ProcessVariablesViewerProps {
  variables?: string | Record<string, unknown>;
  emptyState?: React.ReactNode;
}

export const WorkflowVariablesViewer: React.FC<ProcessVariablesViewerProps> = ({
  variables = {},
  emptyState = <Paragraph>No data available</Paragraph>,
}) => {
  const theme = useTheme();

  const jsonSource = useMemo(() => {
    let value = variables;
    if (typeof variables === 'string') {
      try {
        value = JSON.parse(variables) as Record<string, unknown>;
      } catch {
        value = { error: 'Failed to parse workflow variables' };
      }
    }

    return value;
  }, [variables]);

  return !variables ? (
    <>{emptyState}</>
  ) : (
    <ReactJson
      src={jsonSource as object}
      name={false}
      theme={theme.palette.type === 'dark' ? 'monokai' : 'rjv-default'}
    />
  );
};
WorkflowVariablesViewer.displayName = 'WorkflowVariablesViewer';
