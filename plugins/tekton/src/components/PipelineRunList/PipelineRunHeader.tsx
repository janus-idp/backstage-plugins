import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import { Timestamp } from '@patternfly/react-core';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { tektonGroupColor } from '../../types/types';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import LinkedPipelineRunTaskStatus from './LinkedPipelineRunTaskStatus';
import PlrStatus from './PlrStatus';
import ResourceBadge from './ResourceBadge';

import './PipelineRunHeader.css';

const PipelineRunName = ({ row }: { row: any }) => {
  const { selectedCluster, clusters } = React.useContext(
    TektonResourcesContext,
  );

  const name = (row as PipelineRunKind)?.metadata?.name;

  return (
    <div>
      <Link
        to={`cluster/${
          clusters[selectedCluster as number]
        }/pipelineRun/${name}`}
      >
        <ResourceBadge color={tektonGroupColor} abbr="PLR" name={name || ''} />
      </Link>
    </div>
  );
};

export const PipelineRunHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'NAME',
    field: 'metadata.name',
    type: 'string',
    render: (row): React.ReactNode => <PipelineRunName row={row} />,
  },
  {
    id: 'status',
    title: 'STATUS',
    field: 'status.conditions[0].reason',
    type: 'string',
    render: (row): React.ReactNode => (
      <PlrStatus obj={row as PipelineRunKind} />
    ),
  },
  {
    id: 'task-status',
    title: 'TASK STATUS',
    field: 'status.conditions[0].reason',
    type: 'string',
    render: (row): React.ReactNode => (
      <LinkedPipelineRunTaskStatus pipelineRun={row as PipelineRunKind} />
    ),
  },
  {
    id: 'start-time',
    title: 'STARTED',
    field: 'status.startTime',
    type: 'date',
    defaultSort: 'desc',
    render: (row): React.ReactNode => {
      const startTime = (row as PipelineRunKind)?.status?.startTime || '';
      return startTime ? (
        <Timestamp className="bs-tkn-timestamp" date={new Date(startTime)} />
      ) : (
        '-'
      );
    },
  },
  {
    id: 'duration',
    title: 'DURATION',
    field: 'status.completionTime',
    type: 'string',
    render: (row): React.ReactNode =>
      pipelineRunDuration(row as PipelineRunKind),
  },
];
