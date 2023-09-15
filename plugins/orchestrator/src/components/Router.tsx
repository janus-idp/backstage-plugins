import React from 'react';
import { Route, Routes } from 'react-router-dom';

import {
  createWorkflowRouteRef,
  definitionsRouteRef,
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  newWorkflowRef,
  swfInstanceRouteRef,
  swfInstancesRouteRef,
} from '../routes';
import { CreateSWFPage } from './CreateSWFPage';
import { ExecuteWorkflowPage } from './ExecuteWorkflowPage';
import { NewWorkflowViewerPage } from './NewWorkflowViewerPage';
import { SWFDefinitionViewerPage } from './SWFDefinitionViewerPage';
import { SWFInstancesViewerPage } from './SWFInstancesViewerPage';
import { SWFPage } from './SWFPage';

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<SWFPage />} />
      <Route
        path={definitionsRouteRef.path}
        element={<SWFDefinitionViewerPage />}
      />
      <Route
        path={swfInstancesRouteRef.path}
        element={<SWFInstancesViewerPage />}
      />
      <Route
        path={swfInstanceRouteRef.path}
        element={<SWFInstancesViewerPage />}
      />
      <Route path={newWorkflowRef.path} element={<NewWorkflowViewerPage />} />
      <Route path={createWorkflowRouteRef.path} element={<CreateSWFPage />} />
      <Route path={editWorkflowRouteRef.path} element={<CreateSWFPage />} />
      <Route
        path={executeWorkflowRouteRef.path}
        element={<ExecuteWorkflowPage />}
      />
    </Routes>
  );
};
