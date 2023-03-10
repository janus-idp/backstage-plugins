import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProjectOverviewPage } from './projectOverview';
import { Deploy } from './deploy';
import { Notification } from './notification';
import { Training } from './training';
import { Metrics } from './metrics';
import { Workflow } from './workflow/Workflow';
import { Onboarding } from './workflow/onboarding/Onboarding';
import { WorkFlowDetail } from './workflow/workflowDetail/WorkFlowDetail';

export const PluginRouter = () => (
  <Routes>
    <Route path="/" element={<ProjectOverviewPage />} />
    <Route path="/project-overview" element={<ProjectOverviewPage />} />
    <Route path="/workflow" element={<Workflow />} />
    <Route path="/deploy" element={<Deploy />} />
    <Route path="/notification" element={<Notification />} />
    <Route path="/training" element={<Training />} />
    <Route path="/metrics" element={<Metrics />} />
    <Route
      path="/onboarding/:projectId/:workflowName/new/"
      element={<Onboarding isNew />}
    />
    <Route
      path="/onboarding/:executionId/workflow-detail"
      element={<WorkFlowDetail />}
    />
  </Routes>
);
