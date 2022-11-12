import React, { Fragment } from 'react';
import { StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
// eslint-disable-next-line  no-restricted-imports
import { KeyboardArrowDown, KeyboardArrowUp, KeyboardArrowLeft, KeyboardArrowRight, LastPage, FirstPage } from '@material-ui/icons';
import { Table, Typography, Box, TableBody, TableRow, TableCell, IconButton, Collapse, TableHead, Button, SwipeableDrawer, Divider, useTheme } from '@material-ui/core';
import { TablePaginationActionsProps } from '@material-ui/core/TablePagination/TablePaginationActions';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-enable */
export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR = "tektonci/pipeline-label-selector";

type Anchor = 'top' | 'left' | 'bottom' | 'right';

function NewlineText(props: { text: string; }): JSX.Element {
  const text = props.text;
  const newText = text.split('\n').map(str => <p>{str}</p>);

  return (
    <Box>{newText}</Box>
  );
}

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

export function CollapsibleTableRow(props: { pipelineRun: PipelineRun }) {
  const { pipelineRun } = props;
  const [open, setOpen] = React.useState(false);

  const [state, setState] = React.useState({
    bottom: false,
    logValue: "",
  });

  const anchor: Anchor = 'bottom';

  const toggleDrawer =
    // eslint-disable-next-line  @typescript-eslint/no-shadow
    (anchor: Anchor, open: boolean, logValue: string) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event &&
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        state.logValue = logValue
        setState({ ...state, [anchor]: open });
      };

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
                <TableCell>Logs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelineRun.taskRuns !== undefined &&
                pipelineRun.taskRuns.map((taskRunRow) => (
                  <Fragment>
                    <Divider />
                    <TableRow key={taskRunRow.metadata.name} style={{ backgroundColor: "#1a1a1a" }}>
                      <TableCell align="left" rowSpan={taskRunRow.status.steps.length + 1}>
                        {taskRunRow.metadata.name}
                      </TableCell>
                    </TableRow>
                    {taskRunRow.status.steps !== undefined &&
                      taskRunRow.status.steps.map((step) => (
                        <TableRow key={step.name} style={{ backgroundColor: "#1a1a1a" }}>
                          <TableCell>
                            {step.name}
                          </TableCell>
                          <TableCell>
                            <StatusComponent reason={step.terminated.reason} />{step.terminated.reason}
                          </TableCell>
                          <TableCell>
                            {step.terminated.durationString}
                          </TableCell>
                          <TableCell>
                            <Button onClick={toggleDrawer(anchor, true, step.log)}>Show Log</Button>
                            <SwipeableDrawer
                              anchor={anchor}
                              open={state[anchor]}
                              onClose={toggleDrawer(anchor, false, "")}
                              onOpen={toggleDrawer(anchor, true, step.log)}

                            >
                              <Typography style={{ wordWrap: "break-word", width: "auto", margin: 10 }}>1
                                <NewlineText text={state.logValue} />
                              </Typography>
                            </SwipeableDrawer>
                          </TableCell>
                        </TableRow>
                      ))}
                    <Divider />
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </React.Fragment>
  );
}


