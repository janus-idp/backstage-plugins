import { EntityProvider } from '@backstage/plugin-catalog-react';
import React from 'react';
import { Entity } from '@backstage/catalog-model';

// This hack allows us to use Kubernetes plugin on a standalone page. (Normally it requires an Entity.)
// Using a `backstage.io/kubernetes-label-selector` with selector that matches all resources which don't have a stub label
// we can trick the plugin to pull all resources without matching existing labels or a `kubernetes-id`.
const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'allows-us-to-use-kubernetes-plugin-hack',
    annotations: {
      'backstage.io/kubernetes-label-selector': 'this-label-doesnt-exist!=',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export const Wrapper = ({children}: React.PropsWithChildren<{}>) => (
    <EntityProvider entity={mockEntity}>
      {children}
    </EntityProvider>
  );
