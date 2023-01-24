import { Entity } from '@backstage/catalog-model';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  Progress,
  SupportButton,
} from '@backstage/core-components';

/* ignore lint error for internal dependencies */
/* eslint-disable */
import { Cluster, PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-disable */
import { Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { getTektonApi } from '../../api/types';
import logger from '../../logging/logger';
import { CollapsibleTable } from '../CollapsibleTable';

const DEFAULT_REFRESH_INTERVALL = 10000;

type TektonContentProps = {
  entity: Entity;
  refreshIntervalMs?: number;
  children?: React.ReactNode;
};

export function TektonDashboardComponent(props: TektonContentProps) {
  logger.debug(
    `TektonDashboardComponent Refresh interval ${props.refreshIntervalMs}`,
  );
  logger.debug(
    `TektonDashboardComponent Request entity ${JSON.stringify(props.entity)}`,
  );

  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState<Cluster[]>();
  const [error, setError] = useState<string | null>(null);

  const tektonApi = getTektonApi();
  
  /*
  const clusterSize = tektonApi.getClusterSize();
  logger.info("size: " + clusterSize);
  */
  useEffect(() => {
    const interval = setInterval(() => {
      logger.debug('TektonDashboardComponent Query TektonApi');
      tektonApi
        .getPipelineRuns({ entity: props.entity }, '', '', '', '', '', '')
        .then(clusters => {
                logger.info("test")
                logger.info(clusters)
                const sorted = clusters.map((cluster) => 
                      cluster.pipelineRuns.sort((pipelineA, pipelineB) =>
                      pipelineA.status.startTime > pipelineB.status.startTime ? -1 : 1,
                    )
                      )
                return clusters
          }
        )
        .then(clusters => {
          logger.debug(
            `TektonDashboardComponent Pipeline Runs Count: ${Object.keys(clusters).length}`,
          );
          logger.debug(
            `TektonDashboardComponent Pipeline Runs: ${JSON.stringify(
              clusters,
            )} end`,
          );
          setClusters(clusters);
          setLoading(false);
          setError(null);
        })
        .catch(error => {
          logger.debug(
            `TektonDashboardComponent REST Error: ${error.toString()}`,
          );
          setLoading(false);
          setError(error.toString());
        });
    }, props.refreshIntervalMs || DEFAULT_REFRESH_INTERVALL);
    return (() => clearInterval(interval));

  }, [props.entity]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  logger.debug('TektonDashboardComponent Rendering Tekton Pipelines');

  return (
    <Page themeId="tool">
      <Header title="Tekton Pipelines" subtitle="CI/CD">
        <HeaderLabel label="Owner" value="Team Y" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="PipelineRuns">
          <SupportButton>PipelineRuns</SupportButton>
        </ContentHeader>
        {clusters !== undefined && clusters?.length > 0 && (
          clusters.map((cluster) => 
            <Grid container spacing={3} direction="column">
            <ContentHeader title={cluster.name} textAlign="center"></ContentHeader>
            { cluster.pipelineRuns !== undefined && cluster.pipelineRuns !== null && cluster.pipelineRuns.length > 0 && (
            <Grid item>
              <CollapsibleTable clusterName={cluster.name} pipelineruns={cluster.pipelineRuns} />
            </Grid>           
            )}
            </Grid>         
          )
        )}
      </Content>
    </Page>
  );
}
