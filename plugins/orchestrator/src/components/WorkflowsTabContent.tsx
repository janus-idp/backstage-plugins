import React from 'react';
import { useAsync } from 'react-use';

import {
  Content,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import Grid from '@material-ui/core/Grid/Grid';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { WorkflowsTable } from './WorkflowsTable';

export const WorkflowsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);

  const { value, error, loading } = useAsync(async (): Promise<
    WorkflowOverview[]
  > => {
    const data = await orchestratorApi.listWorkflowOverviews();
    return data.items;
  }, []);

  const isReady = React.useMemo(() => !loading && !error, [loading, error]);

  return (
    <Content noPadding>
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {isReady ? (
        <Grid container direction="column">
          <Grid item>
            <WorkflowsTable items={value ?? []} />
          </Grid>
        </Grid>
      ) : null}
    </Content>
  );
};
