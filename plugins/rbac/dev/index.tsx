import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import {
  PermissionApi,
  permissionApiRef,
} from '@backstage/plugin-permission-react';
import { TestApiProvider } from '@backstage/test-utils';

import { RbacPage, rbacPlugin } from '../src/plugin';

class MockPermissionApi implements PermissionApi {
  readonly result;

  constructor(fixtureData: any) {
    this.result = fixtureData;
  }

  async authorize(_request: any): Promise<any> {
    return this.result;
  }
}

const mockApi = new MockPermissionApi({ result: 'ALLOW' });
createDevApp()
  .registerPlugin(rbacPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[permissionApiRef, mockApi]]}>
        <RbacPage />
      </TestApiProvider>
    ),
    title: 'Administration',
    path: '/rbac',
  })
  .render();
