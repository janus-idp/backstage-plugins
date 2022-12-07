import React, { Fragment } from 'react';
import { StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
// eslint-disable-next-line  no-restricted-imports
import { TableRow, TableCell, Button, CircularProgress } from '@material-ui/core';
import { getTektonApi } from '../../api/types';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { Step } from '@jquad-group/plugin-tekton-pipelines-common';
import { StepLog } from '../StepLog';


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

export function StepRow(props: { namespace: string, podName: string, step: Step }) {
  const { namespace, podName, step } = props;

  const [data, setData] = React.useState({data: ""});
  const [isLoading, setIsLoading] = React.useState(false);
  const tektonApi = getTektonApi();

  const handleClick = async (step: Step) => {
    setIsLoading(true);
    
    const response = tektonApi.getLogs('','', namespace, podName, "step-" + step.name);
    const log = await response;
    data.data = log;
    step.log = log;
    
    setData(data);
    setIsLoading(false);
  };
  
  return (
    <Fragment>
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
              <Button value="logs" onClick={() => handleClick(step)} disabled={isLoading}>Show Log</Button>
              {isLoading && (
                <CircularProgress size={15}/>
              )}
                
               {!isLoading && data.data !== "" && (     
                <StepLog opened={true} log={data.data} />
              )} 
            </TableCell>          
          </TableRow>
    </Fragment>
  );
}
