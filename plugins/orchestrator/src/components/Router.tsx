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
  workflowDefinitionsRouteRef,
  workflowInstanceRouteRef,
} from '../routes';
import { CreateWorkflowPage } from './CreateWorkflowPage';
import { ExecuteWorkflowPage } from './ExecuteWorkflowPage/ExecuteWorkflowPage';
import { NewWorkflowViewerPage } from './NewWorkflowViewerPage';
import { OrchestratorPage } from './OrchestratorPage';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';
import { WorkflowInstancePage } from './WorkflowInstancePage';

export const Router = () => {
  return (
    <Routes>
      <Route path="/*" element={<OrchestratorPage />} />
      <Route
        path={workflowInstanceRouteRef.path}
        element={<WorkflowInstancePage />}
      />
      <Route
        path={workflowDefinitionsRouteRef.path}
        element={<WorkflowDefinitionViewerPage />}
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
    </Routes>
  );
};
