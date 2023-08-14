import * as React from 'react';

import { Link } from '@backstage/core-components';

import { TableCell, TableRow } from '@material-ui/core';
import { Timestamp } from '@patternfly/react-core';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { tektonGroupColor } from '../../types/types';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import PipelineRunTaskStatus from './PipelineRunTaskStatus';
import PlrStatus from './PlrStatus';
import ResourceBadge from './ResourceBadge';

import './PipelineRunTableBody.css';

type PipelineRunTableBodyProps = {
  rows: PipelineRunKind[];
};

type PipelineRunNameProps = { row: PipelineRunKind };

const PipelineRunName = ({ row }: PipelineRunNameProps) => {
  const { selectedCluster, clusters } = React.useContext(
    TektonResourcesContext,
  );

  const name = row.metadata?.name;

  return (
    <div>
      {name ? (
        <Link
          to={`cluster/${
            clusters[selectedCluster as number]
          }/pipelineRun/${name}`}
        >
          <ResourceBadge
            color={tektonGroupColor}
            abbr="PLR"
            name={name || ''}
          />
        </Link>
      ) : (
        '-'
      )}
    </div>
  );
};

export const PipelineRunTableBody = ({ rows }: PipelineRunTableBodyProps) => {
  return (
    <>
      {rows.map((row, _index) => {
        const startTime = row.status?.startTime || '';

        return (
          <TableRow key={row.metadata?.uid}>
            <TableCell align="left">
              <PipelineRunName row={row} />
            </TableCell>
            <TableCell align="left">
              <PlrStatus obj={row} />
            </TableCell>
            <TableCell align="left">
              <PipelineRunTaskStatus pipelineRun={row} />
            </TableCell>
            <TableCell align="left">
              {startTime ? (
                <Timestamp
                  className="bs-tkn-timestamp"
                  date={new Date(startTime)}
                />
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell align="left">{pipelineRunDuration(row)}</TableCell>
          </TableRow>
        );
      })}
    </>
  );
};
