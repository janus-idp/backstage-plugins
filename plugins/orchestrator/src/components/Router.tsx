import React from 'react';
import { Route, Routes } from 'react-router-dom';

import {
  createWorkflowRouteRef,
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  newWorkflowRef,
  workflowDefinitionsRouteRef,
  workflowInstanceRouteRef,
  workflowInstancesRouteRef,
} from '../routes';
import { CreateWorkflowPage } from './CreateWorkflowPage';
import { ExecuteWorkflowPage } from './ExecuteWorkflowPage';
import { NewWorkflowViewerPage } from './NewWorkflowViewerPage';
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
      <Route path={newWorkflowRef.path} element={<NewWorkflowViewerPage />} />
      <Route
        path={createWorkflowRouteRef.path}
        element={<CreateWorkflowPage />}
      />
      <Route
        path={editWorkflowRouteRef.path}
        element={<CreateWorkflowPage />}
      />
      <Route
        path={executeWorkflowRouteRef.path}
        element={<ExecuteWorkflowPage />}
      />
    </Routes>
  );
};
