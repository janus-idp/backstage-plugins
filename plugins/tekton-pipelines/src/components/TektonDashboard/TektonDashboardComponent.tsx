import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
  Progress,
} from '@backstage/core-components';
import { usePipelineRunObjects } from '../../hooks/usePipelineRunObjects';
import { Entity } from '@backstage/catalog-model';
import { CollapsibleTable } from '../CollapsibleTable';
import { Alert } from '@material-ui/lab';
import logger from '../../logging/logger';

type TektonContentProps = {
  entity: Entity;
  refreshIntervalMs?: number;
  children?: React.ReactNode;
};

export const TektonDashboardComponent = ({
  entity,
  refreshIntervalMs,
}: TektonContentProps) => {
  const { pipelineRunObjects, loading, error } = usePipelineRunObjects(
    entity,
    refreshIntervalMs,
  );

  logger.log('TektonDashboardComponent loading ' + loading);
  logger.log('TektonDashboardComponent error ' + error);
  logger.log(
    'TektonDashboardComponent pipelineRunObjects ' +
      JSON.stringify(pipelineRunObjects),
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

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
            {pipelineRunObjects !== undefined &&
              pipelineRunObjects?.length > 0 && (
                <CollapsibleTable pipelineruns={pipelineRunObjects} />
              )}
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
