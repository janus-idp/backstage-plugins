import * as React from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { PipelineRunRow } from './PipelineRunRow';

type PipelineRunTableBodyProps = {
  rows: PipelineRunKind[];
};

export const PipelineRunTableBody = ({ rows }: PipelineRunTableBodyProps) => {
  const { isExpanded } = React.useContext(TektonResourcesContext);
  return (
    <>
      {rows.map((row, index, plrs) => {
        const startTime = row.status?.startTime || '';
        const plrCount = plrs.length;

        return (
          <PipelineRunRow
            row={row}
            startTime={startTime}
            isExpanded={isExpanded}
            key={row.metadata?.uid}
            rowIndex={index}
            plrCount={plrCount}
          />
        );
      })}
    </>
  );
};
