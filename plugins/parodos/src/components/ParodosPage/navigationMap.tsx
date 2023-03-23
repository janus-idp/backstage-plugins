import React from 'react';
import {
  AssessmentIcon,
  NotificationIcon,
  ProjectsIcon,
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

  {
    label: 'Notification',
    routes: ['/notification'],
    icon: <NotificationIcon />,
  },
  { label: 'Metrics', routes: ['/metrics'], icon: <MetricsIcon /> },
];
