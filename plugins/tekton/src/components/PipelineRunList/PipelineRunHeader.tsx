import React from 'react';

import { TableColumn } from '@backstage/core-components';

import { Timestamp } from '@patternfly/react-core';
import { chart_color_green_400 as tektonGroupColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';

import { PipelineRunKind } from '../../types/pipelineRun';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import LinkedPipelineRunTaskStatus from './LinkedPipelineRunTaskStatus';
import PlrStatus from './PlrStatus';
import ResourceBadge from './ResourceBadge';

import './PipelineRunHeader.css';

export const PipelineRunHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'NAME',
    field: 'metadata.name',
    type: 'string',
    render: (row): React.ReactNode => (
      <ResourceBadge
        color={tektonGroupColor.value}
        abbr="PLR"
        name={(row as PipelineRunKind)?.metadata?.name || ''}
      />
    ),
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
