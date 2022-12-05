import React, { Fragment } from 'react';
import { StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
// eslint-disable-next-line  no-restricted-imports
import { TableRow, TableCell, Button} from '@material-ui/core';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { TaskRun } from '@jquad-group/plugin-tekton-pipelines-common';
import { getTektonApi } from '../../api/types';
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


export function CollapsibleTableStepRow(props: { taskRun: TaskRun }) {
  const { taskRun } = props;

  const [data, setData] = React.useState({data: []});
  const [isLoading, setIsLoading] = React.useState(false);
  const [err, setErr] = React.useState('');
  const tektonApi = getTektonApi();

  const handleClick = async (stepName: string) => {
    setIsLoading(true);

    /*
    console.log("TESTING")
    const response = tektonApi.getLogs('','',taskRun.metadata.namespace, taskRun.status.podName, stepName);
    console.log(response);
    */
    console.log("CALLING")
    
    try {
      const response = await fetch('http://localhost:7007/api/tekton-pipelines/logs?namespace=pipeline-trigger-operator-system-build&taskRunPodName=main-mzrnr-clone-pod&stepContainer=step-clone', {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log('result is: ', JSON.stringify(result, null, 4));

      setData(result);
    } catch (err) {
      
    } finally {
      setIsLoading(false);
    }
    
    
  };
  
  return (
    <Fragment>
      <TableRow key={taskRun.metadata.name} style={{border: "1px solid rgb(0, 0, 0)"}}>
        <TableCell align="left" rowSpan={taskRun.status.steps.length + 1}>
          {taskRun.metadata.name}
        </TableCell>
      </TableRow>      
      {taskRun.status.steps !== undefined &&
        taskRun.status.steps.map((step) => (
          <TableRow key={step.name}>
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
              <Button onClick={() => handleClick(step.name)}>Download Log</Button>
            </TableCell>
          </TableRow>
        ))}
    </Fragment>
  );
}


