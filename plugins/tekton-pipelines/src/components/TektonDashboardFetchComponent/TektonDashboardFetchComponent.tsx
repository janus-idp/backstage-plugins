/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { Fragment } from 'react';
import { Progress, StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { KeyboardArrowDown, KeyboardArrowUp, KeyboardArrowLeft, KeyboardArrowRight, LastPage, FirstPage } from '@material-ui/icons';
import { Table, Typography, Box, TableContainer, TableBody, TableRow, TableCell, IconButton, Collapse, TableHead, Paper, Button, SwipeableDrawer, Divider, TableFooter, TablePagination, useTheme } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api'
import { useEntity } from '@backstage/plugin-catalog-react'

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}


interface PipelineRun {
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, Label>;
  }

  pipelineRunDashboardUrl: string;

  taskRuns: Array<TaskRun>;

  status: {
    conditions: [
      Condition
    ]
    startTime: Date
    completionTime: Date
    duration: number
    durationString: string
  }

}

interface TaskRun {
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, Label>;
  }
  status: {
    conditions: [
      Condition
    ],
    podName: string;
    steps: Array<Step>;
    startTime: Date;
    completionTime: Date;
    duration: number;
    durationString: string;
  }
}

interface Label {
  key: string;
  value: string;
}

interface Step {
  container: string;
  name: string;
  terminated: Terminated;
  log: string;
}

interface Terminated {
  startedAt: Date
  finishedAt: Date
  duration: number
  durationString: string
  reason: string
}

interface Condition {
  reason: string;
  type: string;
  status: string;
  message: string;
}

type DenseTableProps = {
  pipelineruns: PipelineRun[];
};


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
  if (props.reason == 'Created') {
    return <StatusPending />;
  } else
    if (props.reason == 'Running') {
      return <StatusRunning />;
    } else
      if (props.reason == 'Completed') {
        return <StatusOK />;
      } else
        if (props.reason == 'Succeeded') {
          return <StatusOK />;
        } else
          if (props.reason == 'PipelineRunCancelled') {
            return <StatusWarning />;
          } else
            if (props.reason == 'Failed') {
              return <StatusError />;
            }
  if (props.reason == 'Error') {
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

function Row(props: { pipelineRun: PipelineRun }) {
  const { pipelineRun } = props;
  const [open, setOpen] = React.useState(false);

  const [state, setState] = React.useState({
    bottom: false,
    logValue: "",
  });

  const anchor: Anchor = 'bottom';

  const toggleDrawer =
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
        <TableCell align="right">{pipelineRun.status.startTime}</TableCell>
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


export const CollapsibleTable = ({ pipelineruns }: DenseTableProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - pipelineruns.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell align="right">Namespace</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">Start Time</TableCell>
            <TableCell align="right">Duration</TableCell>
            <TableCell align="right">Dashboard</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? pipelineruns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : pipelineruns
          ).map((pipelineRun) => (
            <Row key={pipelineRun.metadata.name} pipelineRun={pipelineRun} />
          ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={7} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={7}
              count={pipelineruns.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}


export const TektonDashboardFetchComponent = () => {
  const config = useApi(configApiRef)
  const { entity } = useEntity();
  const tektonBuildNamespace = entity?.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE] ?? '';
  const tektonLabelSelector = entity?.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR] ?? '';
  if (!tektonBuildNamespace) {
    throw new Error("The field 'metadata.annotations.tektonci/build-namespace' is missing.");
  }

  const backendUrl = config.getString('backend.baseUrl')

  const { value, loading, error } = useAsync(async (): Promise<PipelineRun[]> => {
    const response = await fetch(`${backendUrl}/api/tekton/pipelineruns?namespace=${tektonBuildNamespace}&selector=${tektonLabelSelector}`, {
      headers: new Headers({
        'Accept': 'application/json'
      })

    }
    );
    const data = await response.json();
    return data;
  }, []);


  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <CollapsibleTable pipelineruns={value || []} />;
};
