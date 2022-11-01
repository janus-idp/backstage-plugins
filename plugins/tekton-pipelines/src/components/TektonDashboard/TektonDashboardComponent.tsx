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
import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { usePipelineRunObjects } from '../../hooks/usePipelineRunObjects';
import { Entity } from '@backstage/catalog-model';

type TektonContentProps = {
  entity: Entity;
  refreshIntervalMs?: number;
  children?: React.ReactNode;
};

export const TektonDashboardComponent = ({
  entity,
  refreshIntervalMs,
}: TektonContentProps)  => {
  const { pipelineRunObjects, loading, error } = usePipelineRunObjects(entity,
    refreshIntervalMs,);
  if (loading) {
    return <div>Loading</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
  <Page themeId="tool">
    <Header title="Tekton Pipelines" subtitle="CI/CD">
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="PipelineRuns">
        <SupportButton>PipelineRuns</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
        {pipelineRunObjects?.length > 0 &&
                pipelineRunObjects?.map((pipelineRun, i) => {

                  return (
                    <Grid item key={i} xs={12}>
                      {pipelineRun.metadata.name}
                    </Grid>
                  );
                })}
        </Grid>
      </Grid>     
    </Content>
  </Page>
  )
  };
