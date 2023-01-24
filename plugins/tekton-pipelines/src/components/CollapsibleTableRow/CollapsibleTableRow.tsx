import React from 'react';
import { StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
// eslint-disable-next-line  no-restricted-imports
import { KeyboardArrowDown, KeyboardArrowUp, KeyboardArrowLeft, KeyboardArrowRight, LastPage, FirstPage } from '@material-ui/icons';
import { Table, Typography, Box, TableBody, TableRow, TableCell, IconButton, Collapse, TableHead, Button, useTheme } from '@material-ui/core';
import { TablePaginationActionsProps } from '@material-ui/core/TablePagination/TablePaginationActions';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
import { setEnvironmentData } from 'worker_threads';
import { TaskRunRow } from '../TaskRunRow';
/* eslint-enable */
export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR = "tektonci/pipeline-label-selector";



function StatusComponent(props: { reason: string; }): JSX.Element {
  if (props.reason === 'Created') {
    return <StatusPending />;
  } else
    if (props.reason === 'Running') {
      return <StatusRunning />;
    } else
      if (props.reason === 'Completed') {
        return <StatusOK />;
      } else
        if (props.reason === 'Succeeded') {
          return <StatusOK />;
        } else
          if (props.reason === 'PipelineRunCancelled') {
            return <StatusWarning />;
          } else
            if (props.reason === 'Failed') {
              return <StatusError />;
            }
  if (props.reason === 'Error') {
    return <StatusError />;
  }
  return <StatusPending />;

}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

 
export function CollapsibleTableRow(props: { clusterName: string, pipelineRun: PipelineRun }) {
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
        <TableCell align="right"><StatusComponent reason={pipelineRun.status.conditions[0].reason} />{pipelineRun.status.conditions[0].reason}</TableCell>
        <TableCell align="right">{pipelineRun.status.startTime.toLocaleString()}</TableCell>
        <TableCell align="right">{pipelineRun.status.durationString}</TableCell>
        <TableCell align="right"><a href={pipelineRun.pipelineRunDashboardUrl} target="_blank">Link</a></TableCell>
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
                pipelineRun.taskRuns.map((taskRunRow) => (
                  <TaskRunRow key={taskRunRow.metadata.name} clusterName={clusterName} taskRun={taskRunRow}/>
                ))}
            </TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </React.Fragment>
  );
}


