import React from 'react';

import { Progress } from '@backstage/core-components';

import { Output } from '@aonic-ui/pipelines';
import { Grid, Paper } from '@material-ui/core';

import {
  PipelineRunKind,
  pipelineRunStatus,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { usePipelineRunOutputData } from '../../hooks/usePipelineRunOutputData';

type PipelineRunOutputProps = {
  pipelineRun: PipelineRunKind;
  taskRuns: TaskRunKind[];
};

const PipelineRunOutput: React.FC<PipelineRunOutputProps> = ({
  pipelineRun,
  taskRuns,
}) => {
  const outputGroup = usePipelineRunOutputData(pipelineRun, taskRuns);

  const stillLoading =
    outputGroup?.ec?.loading &&
    outputGroup?.acsImageScan?.loading &&
    outputGroup?.acsImageCheck?.loading &&
    outputGroup?.acsDeploymentCheck?.loading;

  return (
    <Grid>
      <div style={{ height: '80vh' }}>
        <Paper
          elevation={1}
          style={{ height: '100%', width: '100%', minHeight: '30rem' }}
        >
          {stillLoading ? (
            <Progress />
          ) : (
            <Output
              enterpriseContractPolicies={outputGroup?.ec?.data ?? []}
              acsImageScanResult={outputGroup?.acsImageScan?.data}
              acsImageCheckResults={outputGroup?.acsImageCheck?.data}
              acsDeploymentCheckResults={outputGroup?.acsDeploymentCheck?.data}
              pipelineRunName={pipelineRun?.metadata?.name ?? ''}
              pipelineRunStatus={pipelineRunStatus(pipelineRun) as string}
              results={outputGroup.results.data}
            />
          )}
        </Paper>
      </div>
    </Grid>
  );
};
export default PipelineRunOutput;
