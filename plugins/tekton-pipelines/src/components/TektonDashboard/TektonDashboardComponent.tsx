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
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
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
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tektonApi = getTektonApi();

  useEffect(() => {
    setInterval(() => {
      logger.debug('TektonDashboardComponent Query TektonApi')
      tektonApi
        .getPipelineRuns({ entity: props.entity }, '', '', '', '', '')
        .then(respPipelineRuns => {
          logger.debug(
            `TektonDashboardComponent Pipeline Runs Count: ${respPipelineRuns.length}`,
          );
          setPipelineRuns(respPipelineRuns);
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
        <Grid container spacing={3} direction="column">
          <Grid item>
            {pipelineRuns !== null && pipelineRuns?.length > 0 && (
              <CollapsibleTable pipelineruns={pipelineRuns} />
            )}
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
