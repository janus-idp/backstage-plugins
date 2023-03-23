import React from 'react';
import {
  AssessmentIcon,
  DeployIcon,
  NotificationIcon,
  ProjectsIcon,
  TrainingIcon,
  MetricsIcon,
} from '../icons';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', routes: ['/project-overview'], icon: <ProjectsIcon /> },
  {
    label: 'Assessment',
    routes: ['/workflow', '/onboarding/'],
    icon: <AssessmentIcon />,
  },

  { label: 'Deploy', routes: ['/Deploy'], icon: <DeployIcon /> },
  {
    label: 'Notification',
    routes: ['/notification'],
    icon: <NotificationIcon />,
  },
  { label: 'Training', routes: ['/training'], icon: <TrainingIcon /> },
  { label: 'Metrics', routes: ['/metrics'], icon: <MetricsIcon /> },
];
