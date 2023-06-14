import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import {
  OpenshiftImageRegistryPage,
  openshiftImageRegistryPlugin,
} from '../src/plugin';

createDevApp()
  .registerPlugin(openshiftImageRegistryPlugin)
  .addPage({
    element: <OpenshiftImageRegistryPage />,
    title: 'Root Page',
    path: '/openshift-image-registry',
  })
  .render();
