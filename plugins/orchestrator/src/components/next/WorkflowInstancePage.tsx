import React from 'react';
import { useAsync } from 'react-use';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';

import { orchestratorApiRef } from '../../api';
import { workflowInstanceRouteRef } from '../../routes';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';
import { WorkflowInstancePageContent } from './WorkflowInstancePageContent';

export const WorkflowInstancePage = ({
  instanceId,
}: {
  instanceId?: string;
}) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { instanceId: queryInstanceId } = useRouteRefParams(
    workflowInstanceRouteRef,
  );

  const { loading, error, value } = useAsync(async () => {
    if (!instanceId && !queryInstanceId) {
      return undefined;
    }
    return await orchestratorApi.getInstance(instanceId || queryInstanceId);
  }, [orchestratorApi, queryInstanceId]);

  const isReady = React.useMemo(() => !loading && !error, [loading, error]);

  return (
    <BaseOrchestratorPage
      title={value?.processId ?? value?.id ?? instanceId}
      type="Workflow runs"
      typeLink="/orchestrator/next/instances"
    >
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {isReady ? <WorkflowInstancePageContent processInstance={value} /> : null}
    </BaseOrchestratorPage>
  );
};
