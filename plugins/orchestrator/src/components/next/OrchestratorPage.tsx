import React from 'react';

import { TabbedLayout } from '@backstage/core-components';

import { workflowInstancesRouteRef } from '../../routes';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';
import { WorkflowRunListContent } from './WorkflowRunListContent';
import { WorkflowsTableContent } from './WorkflowsTableContent';

export const OrchestratorPage = () => {
  return (
    <BaseOrchestratorPage title="Workflow Orchestrator" noPadding>
      <TabbedLayout>
        <TabbedLayout.Route path="/" title="Workflows">
          <WorkflowsTableContent />
        </TabbedLayout.Route>
        <TabbedLayout.Route
          path={workflowInstancesRouteRef.path}
          title="Workflow runs"
        >
          <WorkflowRunListContent />
        </TabbedLayout.Route>
      </TabbedLayout>
    </BaseOrchestratorPage>
  );
};
