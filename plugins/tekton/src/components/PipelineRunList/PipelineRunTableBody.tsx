import * as React from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { OpenRowStatus } from '../../types/types';
import { PipelineRunRow } from './PipelineRunRow';

type PipelineRunTableBodyProps = {
  rows: PipelineRunKind[];
};

export const PipelineRunTableBody = ({ rows }: PipelineRunTableBodyProps) => {
  const { isExpanded } = React.useContext(TektonResourcesContext);
  const [open, setOpen] = React.useState<OpenRowStatus>(
    rows.reduce((acc, row) => {
      if (row.metadata?.uid) {
        acc[row.metadata?.uid] = isExpanded ?? false;
      }
      return acc;
    }, {} as OpenRowStatus),
  );

  return (
    <>
      {rows.map((row: PipelineRunKind) => {
        const startTime = row.status?.startTime || '';

        return (
          <PipelineRunRow
            row={row}
            startTime={startTime}
            isExpanded={isExpanded}
            key={row.metadata?.uid}
            open={row.metadata?.uid ? open[row.metadata.uid] : false}
            setOpen={setOpen}
          />
        );
      })}
    </>
  );
};
