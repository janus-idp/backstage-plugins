/*
curl -s https://rancher.jquad.rocks/apis/tekton.dev/v1beta1/namespaces/sample-go-aplication-build/pipelineruns --header "Authorization: Bearer token-ms7t6:lwsftplxxrll7wq4fnl5fl5t42l7pxfp2rnggr62cg4ml7ds5ckbh2" -v
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
import React from 'react';
import {Progress, StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { Table, Typography, Box, TableContainer, TableBody, TableRow, TableCell, IconButton, Collapse, TableHead, Paper, Button, ListItem, List, ListItemIcon, Divider, SwipeableDrawer, TextField } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api'
import { useEntity } from '@backstage/plugin-catalog-react'
import { Skeleton } from '@material-ui/lab';


interface PipelineRun {
  metadata: {
    name: string; 
    namespace: string; 
    labels: Array<string>;
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
    labels: Array<string>;
  }
  status: {
    conditions: [
      Condition
    ],
    startTime: Date
    completionTime: Date
    duration: number
    durationString: string
  }
  log: string;
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

function SwipeableTemporaryDrawer() {
  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text}>
            <Button>
              {text}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      {(['right'] as const).map((anchor) => (
        <React.Fragment key={anchor}>
          <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
          <SwipeableDrawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            onOpen={toggleDrawer(anchor, true)}
          >
            {list(anchor)}
          </SwipeableDrawer>
        </React.Fragment>
      ))}
    </div>
  );
}


function Row(props: { pipelineRun: PipelineRun }) {
  const { pipelineRun } = props;
  const [open, setOpen] = React.useState(false);
  const [openDrawer, setOpenDrawer] = React.useState(false)
  /*
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpenDrawer(newOpen);
  };
  */
  /*
  const showAlert = (a: string) => {
    alert(a);
  }
  */

  
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
        <TableCell align="right">{pipelineRun.status.conditions[0].reason}</TableCell>
        <TableCell align="right">{pipelineRun.status.startTime}</TableCell>
        <TableCell align="right">{pipelineRun.status.durationString}</TableCell>
        <TableCell align="right"><a href={pipelineRun.pipelineRunDashboardUrl} target="_blank">Link</a></TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                TaskRuns
              </Typography>
              <Table size="small" aria-label="taskruns">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Logs</TableCell>
                  </TableRow>
                </TableHead>                
                <TableBody>
                  {pipelineRun.taskRuns !== undefined && 
                  pipelineRun.taskRuns.map((taskRunRow) => (
                    <TableRow key={taskRunRow.metadata.name}>
                      <TableCell component="th" scope="row">
                        {taskRunRow.metadata.name}
                      </TableCell>
                      <TableCell>{taskRunRow.status.conditions[0].reason}</TableCell>
                      <TableCell>{taskRunRow.status.startTime}</TableCell>
                      <TableCell>{taskRunRow.status.durationString}</TableCell>
                      <TableCell>
                      <Button variant="outlined" onClick={() => setOpenDrawer(true)}>Show log</Button>
                      {openDrawer && (<SwipeableDrawer
                              anchor="bottom"
                              open={open}
                              onClose={() => setOpenDrawer(false)}
                              onOpen={() => setOpenDrawer(true)}
                              disableSwipeToOpen={false}
                              ModalProps={{
                                keepMounted: true,
                              }}
                            >
                              <Box>                               
                                {taskRunRow.log}
                              </Box>
                        </SwipeableDrawer>
                      )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>           
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}


function getStatusComponent(status: string | undefined = '') {
    if (status == 'Created') {
      return <StatusPending />;
    } else
    if (status == 'Running') {
      return <StatusRunning />;
    } else
    if (status == 'Completed') {
      return <StatusOK />;
    } else
    if (status == 'Succeeded') {
      return <StatusOK />;
    } else
    if (status == 'PipelineRunCancelled') {
      return <StatusWarning />;
    } else
    if (status == 'Failed') {
      return <StatusError />;      
    } else {
      return <StatusPending />;
    }

};

export const CollapsibleTable = ({ pipelineruns }: DenseTableProps) => { 

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
          {pipelineruns.map((pipelineRun) => (
            <Row key={pipelineRun.metadata.name} pipelineRun={pipelineRun} />
          ))}
        </TableBody>
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
