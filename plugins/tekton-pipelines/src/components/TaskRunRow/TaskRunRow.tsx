import React, { Fragment } from 'react';
// eslint-disable-next-line  no-restricted-imports
import { TableRow, TableCell } from '@material-ui/core';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { TaskRun } from '@jquad-group/plugin-tekton-pipelines-common';
import { StepRow } from '../StepRow';

export function TaskRunRow(props: { clusterName: string; taskRun: TaskRun }) {
  const { clusterName, taskRun } = props;

  return (
    <Fragment>
      <TableRow
        key={taskRun.metadata.name}
        style={{ border: '1px solid rgb(0, 0, 0)' }}
      >
        <TableCell align="left" rowSpan={taskRun.status.steps.length + 1}>
          {taskRun.metadata.name}
        </TableCell>
      </TableRow>
      {taskRun.status.steps !== undefined &&
        taskRun.status.steps.map(step => (
          <StepRow
            key={step.name}
            clusterName={clusterName}
            namespace={taskRun.metadata.namespace}
            podName={taskRun.status.podName}
            step={step}
          />
        ))}
    </Fragment>
  );
}
