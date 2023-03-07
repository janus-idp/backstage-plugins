import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProjectOverviewPage } from './projectOverview';
import { Onboarding, WorkFlowDetail } from './workflow';
import { Deploy } from './deploy';
import { Notification } from './notification';
import { Training } from './training';
import { Metrics } from './metrics';
import { RJSFWorkflow } from './rjsf-workflow/RJSFWorkflow';

export const PluginRouter = () => (
  <Routes>
    <Route path="/" element={<ProjectOverviewPage />} />
    <Route path="/project-overview" element={<ProjectOverviewPage />} />
    <Route path="/workflow" element={<RJSFWorkflow />} />
    <Route path="/deploy" element={<Deploy />} />
    <Route path="/notification" element={<Notification />} />
    <Route path="/training" element={<Training />} />
    <Route path="/metrics" element={<Metrics />} />
    <Route
      path="/onboarding/:projectId/:workflowId/new/"
      element={<Onboarding isNew />}
    />
    <Route
      path="/onboarding/:executionId/workflow-detail"
      element={<WorkFlowDetail isNew />}
    />
  </Routes>
);
