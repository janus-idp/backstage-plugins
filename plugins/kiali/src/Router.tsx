import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import { Content, Page } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { pluginRoot } from './components/BreadcrumbView/BreadcrumbView';
import { AppDetailsPage } from './pages/AppDetails/AppDetailsPage';
import { AppListPage } from './pages/AppList/AppListPage';
import { KialiNoPath } from './pages/Kiali';
import { KialiHeader } from './pages/Kiali/Header/KialiHeader';
import { KialiHeaderEntity } from './pages/Kiali/Header/KialiHeaderEntity';
import { KialiTabs } from './pages/Kiali/Header/KialiTabs';
import { KialiEntity } from './pages/Kiali/KialiEntity';
import { KialiNoAnnotation } from './pages/Kiali/KialiNoAnnotation';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { ServiceDetailsPage } from './pages/ServiceDetails/ServiceDetailsPage';
import { ServiceListPage } from './pages/ServiceList/ServiceListPage';
import { WorkloadDetailsPage } from './pages/WorkloadDetails/WorkloadDetailsPage';
import { WorkloadListPage } from './pages/WorkloadList/WorkloadListPage';
import {
  appDetailRouteRef,
  appsRouteRef,
  overviewRouteRef,
  servicesDetailRouteRef,
  servicesRouteRef,
  workloadsDetailRouteRef,
  workloadsRouteRef,
} from './routes';
import { KialiProvider } from './store/KialiProvider';

export const KUBERNETES_ANNOTATION = 'backstage.io/kubernetes-id';
export const KUBERNETES_NAMESPACE = 'backstage.io/kubernetes-namespace';
export const KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

export const ANNOTATION_SUPPORTED = [KUBERNETES_NAMESPACE];

const validateAnnotation = (entity: Entity) => {
  let validated = false;
  ANNOTATION_SUPPORTED.forEach(key => {
    if (Boolean(entity.metadata.annotations?.[key])) {
      validated = true;
    }
  });
  return validated;
};

/*
  Router for entity
*/

export const EmbeddedRouter = () => {
  const { entity } = useEntity();

  return !validateAnnotation(entity) ? (
    <KialiNoAnnotation />
  ) : (
    <KialiProvider entity={entity}>
      <KialiHeaderEntity />
      <Routes>
        <Route path="/" element={<KialiEntity />} />
        <Route path="*" element={<KialiNoPath />} />
      </Routes>
    </KialiProvider>
  );
};

export const getRoutes = (dev?: boolean) => {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route
        path={dev ? `/${pluginRoot}/overview` : overviewRouteRef.path}
        element={<OverviewPage />}
      />
      <Route
        path={dev ? `/${pluginRoot}/workloads` : workloadsRouteRef.path}
        element={<WorkloadListPage />}
      />
      <Route
        path={dev ? `/${pluginRoot}/services` : servicesRouteRef.path}
        element={<ServiceListPage />}
      />
      <Route
        path={dev ? `/${pluginRoot}/applications` : appsRouteRef.path}
        element={<AppListPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginRoot}/workloads/:namespace/:workload`
            : workloadsDetailRouteRef.path
        }
        element={<WorkloadDetailsPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginRoot}/services/:namespace/:service`
            : servicesDetailRouteRef.path
        }
        element={<ServiceDetailsPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginRoot}/applications/:namespace/:app`
            : appDetailRouteRef.path
        }
        element={<AppDetailsPage />}
      />
      {dev && (
        <Route path={`/${pluginRoot}/kiali/entity`} element={<KialiEntity />} />
      )}
      <Route path="*" element={<KialiNoPath />} />
    </Routes>
  );
};

export const Router = () => {
  return (
    <KialiProvider>
      <Page themeId="tool">
        <KialiHeader />
        <KialiTabs />
        <Content>{getRoutes()}</Content>
      </Page>
    </KialiProvider>
  );
};
