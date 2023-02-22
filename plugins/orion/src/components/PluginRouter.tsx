import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProjectOverviewPage } from './projectOverview';
import { Workflow } from './workflow';
import { Deploy } from './deploy';
import { Notification } from './notification';
import { Training } from './training';
import { Metrics } from './metrics';
import {
  AssessmentIcon,
  NotificationsIcon,
  ProjectsIcon,
  TrainingIcon,
} from './icons';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', route: '/project-overview', icon: <ProjectsIcon /> },
  { label: 'Assessment', route: '/workflow', icon: <AssessmentIcon /> },
  {
    label: 'Notifications',
    route: '/notification',
    icon: <NotificationsIcon />,
  },
  { label: 'Training', route: '/training', icon: <TrainingIcon /> },
];

export const PluginRouter = () => (
  <Routes>
    <Route path="/" element={<ProjectOverviewPage />} />
    <Route path="/project-overview" element={<ProjectOverviewPage />} />
    <Route path="/workflow" element={<Workflow />} />
    <Route path="/deploy" element={<Deploy />} />
    <Route path="/notification" element={<Notification />} />
    <Route path="/training" element={<Training />} />
    <Route path="/metrics" element={<Metrics />} />
  </Routes>
);
