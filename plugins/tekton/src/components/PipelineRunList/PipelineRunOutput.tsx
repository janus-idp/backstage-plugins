import React from 'react';

import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes';

import {
  ACSCheckResults,
  ACSImageScanResult,
  Output,
  PipelineRunKind as PipelineRunV1Kind,
  TaskRunKind as TaskRunV1Kind,
  usePipelineRunOutput,
} from '@aonic-ui/pipelines';
import { Grid, Paper, Typography } from '@material-ui/core';

import { PipelineRunKind, TaskRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { TektonResourcesContextData } from '../../types/types';

type PipelineRunOutputProps = {
  pipelineRun: PipelineRunKind;
  taskRuns: TaskRunKind[];
};

const PipelineRunOutput: React.FC<PipelineRunOutputProps> = ({
  pipelineRun,
  taskRuns,
}) => {
  const { clusters, selectedCluster } =
    React.useContext<TektonResourcesContextData>(TektonResourcesContext);
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);

  const currCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';

  const getLogs = React.useCallback(
    async (podName: string, containerName: string): Promise<string> => {
      return await kubernetesProxyApi
        .getPodLogs({
          podName: podName,
          namespace: pipelineRun?.metadata?.namespace ?? '',
          containerName: containerName,
          clusterName: currCluster,
        })
        .then(res => res?.text);
    },
    [kubernetesProxyApi],
  );

  const outputGroup = usePipelineRunOutput(
    pipelineRun as PipelineRunV1Kind,
    taskRuns as TaskRunV1Kind[],
    getLogs,
  );

  const stillLoading =
    outputGroup?.ec?.loading &&
    (outputGroup?.acsImageScan?.loading ||
      outputGroup?.acsImageCheck?.loading ||
      outputGroup?.acsDeploymentCheck?.loading);

  const isEmpty = (data: ACSCheckResults | ACSImageScanResult) =>
    Object.keys(data).length === 0;
  const noDataAvailable =
    outputGroup?.ec?.data.length === 0 &&
    outputGroup.results.data.length === 0 &&
    isEmpty(outputGroup?.acsImageScan?.data) &&
    isEmpty(outputGroup?.acsImageScan?.data) &&
    isEmpty(outputGroup?.acsImageScan?.data);

  const renderOutput = () => {
    if (stillLoading) {
      return <Progress />;
    }

    if (!stillLoading && noDataAvailable) {
      return (
        <Typography align="center" variant="body2">
          No output found
        </Typography>
      );
    }

    const metadata =
      outputGroup?.acsImageCheck?.data?.results?.[0]?.metadata?.additionalInfo;
    if (metadata?.name?.includes('@')) {
      metadata.name = metadata?.name.substr(0, metadata?.name.lastIndexOf('@'));
    }

    return (
      <Output
        enterpriseContractPolicies={outputGroup?.ec?.data ?? []}
        acsImageScanResult={outputGroup?.acsImageScan?.data}
        acsImageCheckResults={outputGroup?.acsImageCheck?.data}
        acsDeploymentCheckResults={outputGroup?.acsDeploymentCheck?.data}
        pipelineRunName={pipelineRun?.metadata?.name ?? ''}
        pipelineRunStatus={outputGroup.status}
        results={outputGroup.results.data}
      />
    );
  };

  return (
    <Grid>
      <div style={{ height: '80vh' }}>
        <Paper
          elevation={1}
          style={{ height: '100%', width: '100%', minHeight: '30rem' }}
        >
          {renderOutput()}
        </Paper>
      </div>
    </Grid>
  );
};
export default PipelineRunOutput;
