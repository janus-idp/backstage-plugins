import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';

import { InfoCard } from '@backstage/core-components';

import { useTheme } from '@material-ui/core';

import { Paragraph } from '../Paragraph/Paragraph';

interface ProcessVariablesViewerProps {
  variables: Record<string, unknown> | string | undefined;
}

export const ProcessVariablesViewer = (props: ProcessVariablesViewerProps) => {
  const { variables } = props;
  const theme = useTheme();

  const jsonSource = useMemo(() => {
    if (!variables) {
      return undefined;
    }
    if (typeof variables === 'string') {
      return JSON.parse(variables);
    }
    return variables;
  }, [variables]);

  return (
    <InfoCard title="Variables">
      {variables === undefined && <Paragraph>No instance selected</Paragraph>}
      <div>
        {variables && (
          <ReactJson
            src={jsonSource}
            name={false}
            theme={theme.palette.type === 'dark' ? 'monokai' : 'rjv-default'}
          />
        )}
      </div>
    </InfoCard>
  );
};
