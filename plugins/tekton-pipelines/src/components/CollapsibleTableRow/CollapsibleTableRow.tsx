import React from 'react';
import {
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';
// eslint-disable-next-line  no-restricted-imports
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import {
  Table,
  Typography,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  TableHead,
} from '@material-ui/core';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
import { TaskRunRow } from '../TaskRunRow';
/* eslint-enable */
export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR =
  'tektonci/pipeline-label-selector';

function StatusComponent(props: { reason: string }): JSX.Element {
  if (props.reason === 'Created') {
    return <StatusPending />;
  } else if (props.reason === 'Running') {
    return <StatusRunning />;
  } else if (props.reason === 'Completed') {
    return <StatusOK />;
  } else if (props.reason === 'Succeeded') {
    return <StatusOK />;
  } else if (props.reason === 'PipelineRunCancelled') {
    return <StatusWarning />;
  } else if (props.reason === 'Failed') {
    return <StatusError />;
  }
  if (props.reason === 'Error') {
    return <StatusError />;
  }
  return <StatusPending />;
}

export function CollapsibleTableRow(props: {
  clusterName: string;
  pipelineRun: PipelineRun;
}) {
  const { clusterName, pipelineRun } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {pipelineRun.metadata.name}
        </TableCell>
        <TableCell align="right">{pipelineRun.metadata.namespace}</TableCell>
        <TableCell align="right">
          <StatusComponent reason={pipelineRun.status.conditions[0].reason} />
          {pipelineRun.status.conditions[0].reason}
        </TableCell>
        <TableCell align="right">
          {pipelineRun.status.startTime.toLocaleString()}
        </TableCell>
        <TableCell align="right">{pipelineRun.status.durationString}</TableCell>
        <TableCell align="right">
          <a href={pipelineRun.pipelineRunDashboardUrl} target="_blank">
            Link
          </a>
        </TableCell>
      </TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Typography variant="h6" gutterBottom component="div">
            TaskRuns
          </Typography>
          <Table size="small" aria-label="taskruns">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Step</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Log</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelineRun.taskRuns !== undefined &&
                pipelineRun.taskRuns.map(taskRunRow => (
                  <TaskRunRow
                    key={taskRunRow.metadata.name}
                    clusterName={clusterName}
                    taskRun={taskRunRow}
                  />
                ))}
            </TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </React.Fragment>
  );
}
