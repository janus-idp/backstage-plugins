import React from 'react';

import { Content, Header, HeaderTabs, Page } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';

import { dynamicPluginsInfoApiRef } from '../src/api/types';
import { DynamicPluginsInfoContent } from '../src/components/DynamicPluginsInfoContent/DynamicPluginsInfoContent';
import { dynamicPluginsInfoPlugin } from '../src/plugin';

export const listLoadedPluginsResult = [
  {
    name: 'some-plugin-one',
    version: '0.1.0',
    role: 'frontend-plugin',
    platform: 'web',
  },
  {
    name: 'some-plugin-two',
    version: '1.1.0',
    role: 'backend-plugin-module',
    platform: 'node',
  },
  {
    name: 'some-plugin-three',
    version: '0.1.2',
    role: 'backend-plugin',
    platform: 'node',
  },
  {
    name: 'some-plugin-four',
    version: '1.1.0',
    role: 'frontend-plugin',
    platform: 'web',
  },
  {
    name: 'some-plugin-five',
    version: '1.2.0',
    role: 'frontend-plugin',
    platform: 'web',
  },
  {
    name: 'some-plugin-six',
    version: '0.6.3',
    role: 'backend-plugin',
    platform: 'node',
  },
];

const mockedApi = {
  listLoadedPlugins: async () => {
    return listLoadedPluginsResult;
  },
};

createDevApp()
  .registerPlugin(dynamicPluginsInfoPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[dynamicPluginsInfoApiRef, mockedApi]]}>
        <Page themeId="theme">
          <Header title="Administration" />
          <HeaderTabs
            selectedIndex={1}
            tabs={[
              {
                id: 'rbac',
                label: 'RBAC',
              },
              {
                id: 'plugins',
                label: 'Plugins',
              },
            ]}
          />
          <Content>
            <DynamicPluginsInfoContent />
          </Content>
        </Page>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/dynamic-plugins-info',
  })
  .render();
