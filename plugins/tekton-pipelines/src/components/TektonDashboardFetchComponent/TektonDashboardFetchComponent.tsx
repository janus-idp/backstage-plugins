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
import React, { Fragment } from 'react';
import {Progress, StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { Table, Typography, Box, TableContainer, TableBody, TableRow, TableCell, IconButton, Collapse, TableHead, Paper, Button, SwipeableDrawer, Divider } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api'
import { useEntity } from '@backstage/plugin-catalog-react'


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
    podName: string;
    steps: Array<Step>;
    startTime: Date;
    completionTime: Date;
    duration: number;
    durationString: string;
  }
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
  } else {
    return <StatusPending />;
  }
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
        <TableCell align="right"><StatusComponent reason={pipelineRun.status.conditions[0].reason}/>{pipelineRun.status.conditions[0].reason}</TableCell>
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
                    <Divider></Divider>
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
                           <StatusComponent reason={step.terminated.reason}/>{step.terminated.reason}
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
                      <Divider></Divider>                                                               
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
