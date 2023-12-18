import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { FeatureFlagged } from '@backstage/core-app-api';

import { FEATURE_FLAG_DEVELOPER_MODE } from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  createWorkflowRouteRef,
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  executeWorkflowWithBusinessKeyRouteRef,
  newWorkflowRef,
  nextExecuteWorkflowRouteRef,
  nextOrchestratorRootRouteRef,
  nextWorkflowInstanceRouteRef,
  workflowDefinitionsRouteRef,
  workflowInstanceRouteRef,
  workflowInstancesRouteRef,
} from '../routes';
import { CreateWorkflowPage } from './CreateWorkflowPage';
import { ExecuteWorkflowPage } from './ExecuteWorkflowPage';
import { NewWorkflowViewerPage } from './NewWorkflowViewerPage';
import { ExecuteWorkflowPage as ExecuteWorkflowPageNext } from './next/ExecuteWorkflowPage';
import { OrchestratorPage as OrchestratorPageNext } from './next/OrchestratorPage';
import { WorkflowInstancePage } from './next/WorkflowInstancePage';
import { OrchestratorPage } from './OrchestratorPage';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';
import { WorkflowInstancesViewerPage } from './WorkflownstancesViewerPage';

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<OrchestratorPage />} />
      <Route
        path={workflowDefinitionsRouteRef.path}
        element={<WorkflowDefinitionViewerPage />}
      />
      <Route
        path={workflowInstancesRouteRef.path}
        element={<WorkflowInstancesViewerPage />}
      />
      <Route
        path={workflowInstanceRouteRef.path}
        element={<WorkflowInstancesViewerPage />}
      />
      <Route
        path={newWorkflowRef.path}
        element={
          <FeatureFlagged with={FEATURE_FLAG_DEVELOPER_MODE}>
            <NewWorkflowViewerPage />
          </FeatureFlagged>
        }
      />
      <Route
        path={createWorkflowRouteRef.path}
        element={
          <FeatureFlagged with={FEATURE_FLAG_DEVELOPER_MODE}>
            <CreateWorkflowPage />
          </FeatureFlagged>
        }
      />
      <Route
        path={editWorkflowRouteRef.path}
        element={
          <FeatureFlagged with={FEATURE_FLAG_DEVELOPER_MODE}>
            <CreateWorkflowPage />
          </FeatureFlagged>
        }
      />
      <Route
        path={executeWorkflowRouteRef.path}
        element={<ExecuteWorkflowPage />}
      />
      <Route
        path={executeWorkflowWithBusinessKeyRouteRef.path}
        element={<ExecuteWorkflowPage />}
      />
      <Route
        path={nextOrchestratorRootRouteRef.path}
        element={<OrchestratorPageNext />}
      />
      <Route
        path={nextWorkflowInstanceRouteRef.path}
        element={<WorkflowInstancePage />}
      />
      <Route path="/next/*" element={<OrchestratorPageNext />} />
      <Route
        path={nextExecuteWorkflowRouteRef.path}
        element={<ExecuteWorkflowPageNext />}
      />
    </Routes>
  );
};
