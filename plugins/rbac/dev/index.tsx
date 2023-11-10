import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { RbacPage, rbacPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(rbacPlugin)
  .addPage({
    element: <RbacPage />,
    title: 'Administration',
    path: '/rbac',
  })
  .render();
