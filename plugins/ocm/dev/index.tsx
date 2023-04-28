import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { ocmPlugin, OcmPage } from '../src/plugin';
import {
  CatalogApi,
  EntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { createApiFactory } from '@backstage/core-plugin-api';
import { SearchApi, searchApiRef } from '@backstage/plugin-search-react';
import { Entity } from '@backstage/catalog-model';
import { CatalogEntityPage } from '@backstage/plugin-catalog';
import { Grid } from '@material-ui/core';
import {
  ClusterAllocatableResourceCard,
  ClusterAvailableResourceCard,
  ClusterContextProvider,
  ClusterInfoCard,
  ClusterStatusCard,
} from '../src';

const clusterEntity = (name: string): Entity => ({
  apiVersion: 'backstage.io/v1beta1',
  kind: 'Resource',
  spec: { owner: 'unknown', type: 'kubernetes-cluster' },
  metadata: {
    name,
    namespace: 'default',
    annotations: {
      'janus-idp.io/ocm-provider-id': 'hub',
    },
  },
});

const clusterEntityPage = (name: string): JSX.Element => (
  <EntityProvider entity={clusterEntity(name)}>
    <ClusterContextProvider>
      <Grid container>
        <Grid container item direction="column" xs={3}>
          <Grid item>
            <ClusterStatusCard />
          </Grid>
          <Grid item>
            <ClusterAllocatableResourceCard />
          </Grid>
          <Grid item>
            <ClusterAvailableResourceCard />
          </Grid>
        </Grid>
        <Grid item xs>
          <ClusterInfoCard />
        </Grid>
      </Grid>
    </ClusterContextProvider>
  </EntityProvider>
);

const clusters = [
  clusterEntity('foo'),
  clusterEntity('cluster1'),
  clusterEntity('offline-cluster'),
];

createDevApp()
  .registerApi({
    api: catalogApiRef,
    deps: {},
    factory: () =>
      ({
        async getEntities() {
          return {
            items: clusters,
          };
        },
        async getEntityByRef(ref: string) {
          return clusters.find(e => e.metadata.name === ref);
        },
      } as CatalogApi),
  })
  .registerApi(
    createApiFactory({
      api: searchApiRef,
      deps: {},
      factory: () =>
        ({
          async query() {
            return new Promise(() => {});
          },
        } as SearchApi),
    }),
  )
  .registerPlugin(ocmPlugin)
  .addPage({
    element: <OcmPage />,
    title: 'Root Page',
    path: '/ocm',
  })
  .addPage({
    path: '/catalog/:kind/:namespace/:name',
    element: <CatalogEntityPage />,
  })
  .addPage({
    path: '/catalog/resource/default/foo',
    element: clusterEntityPage('foo'),
  })
  .addPage({
    path: '/catalog/resource/default/cluster1',
    element: clusterEntityPage('cluster1'),
  })
  .addPage({
    path: '/catalog/resource/default/offline-cluster',
    element: clusterEntityPage('offline-cluster'),
  })
  .render();
