import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import { Content, Page } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { AppDetailsPage } from '../pages/AppDetails/AppDetailsPage';
import { AppListPage } from '../pages/AppList/AppListPage';
import { IstioConfigDetailsPage } from '../pages/IstioConfigDetails/IstioConfigDetailsPage';
import { IstioConfigListPage } from '../pages/IstioConfigList/IstioConfigListPage';
import { KialiNoPath } from '../pages/Kiali';
import { KialiHeader } from '../pages/Kiali/Header/KialiHeader';
import { KialiHeaderEntity } from '../pages/Kiali/Header/KialiHeaderEntity';
import { KialiTabs } from '../pages/Kiali/Header/KialiTabs';
import { KialiEntity } from '../pages/Kiali/KialiEntity';
import { KialiNoAnnotation } from '../pages/Kiali/KialiNoAnnotation';
import { OverviewPage } from '../pages/Overview/OverviewPage';
import { ServiceDetailsPage } from '../pages/ServiceDetails/ServiceDetailsPage';
import { ServiceListPage } from '../pages/ServiceList/ServiceListPage';
import { WorkloadDetailsPage } from '../pages/WorkloadDetails/WorkloadDetailsPage';
import { WorkloadListPage } from '../pages/WorkloadList/WorkloadListPage';
import { pluginName } from '../plugin';
import {
  appDetailRouteRef,
  appsRouteRef,
  istioConfigDetailRouteRef,
  istioConfigRouteRef,
  overviewRouteRef,
  servicesDetailRouteRef,
  servicesRouteRef,
  workloadsDetailRouteRef,
  workloadsRouteRef,
} from '../routes';
import { KialiProvider } from '../store/KialiProvider';

export const KUBERNETES_ANNOTATION = 'backstage.io/kubernetes-id';
export const KUBERNETES_NAMESPACE = 'backstage.io/kubernetes-namespace';
export const KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

export const ANNOTATION_SUPPORTED = [KUBERNETES_NAMESPACE];

const validateAnnotation = (entity: Entity) => {
  let validated = false;
  ANNOTATION_SUPPORTED.forEach(key => {
    if (entity.metadata.annotations?.[key]) {
      validated = true;
    }
  });
  return validated;
};

/*
  Router for entity
*/

export const getEntityRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<KialiEntity />} />
      <Route
        path={`${workloadsDetailRouteRef.path}`}
        element={<WorkloadDetailsPage entity />}
      />
      <Route
        path={`${servicesDetailRouteRef.path}`}
        element={<ServiceDetailsPage entity />}
      />
      <Route
        path={`${appDetailRouteRef.path}`}
        element={<AppDetailsPage entity />}
      />
      <Route path="*" element={<KialiNoPath />} />
      <Route
        path={`${istioConfigDetailRouteRef.path}`}
        element={<IstioConfigDetailsPage entity />}
      />
    </Routes>
  );
};
export const EmbeddedRouter = () => {
  const { entity } = useEntity();

  return !validateAnnotation(entity) ? (
    <KialiNoAnnotation />
  ) : (
    <KialiProvider entity={entity}>
      <KialiHeaderEntity />
      {getEntityRoutes()}
    </KialiProvider>
  );
};

export const getRoutes = (dev?: boolean) => {
  return (
    <Routes>
      <Route path="/*" element={<OverviewPage />} />
      <Route
        path={dev ? `/${pluginName}/overview` : overviewRouteRef.path}
        element={<OverviewPage />}
      />
      <Route
        path={dev ? `/${pluginName}/workloads` : workloadsRouteRef.path}
        element={<WorkloadListPage />}
      />
      <Route
        path={dev ? `/${pluginName}/services` : servicesRouteRef.path}
        element={<ServiceListPage />}
      />
      <Route
        path={dev ? `/${pluginName}/applications` : appsRouteRef.path}
        element={<AppListPage />}
      />
      <Route
        path={dev ? `/${pluginName}/istio` : istioConfigRouteRef.path}
        element={<IstioConfigListPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginName}/workloads/:namespace/:workload`
            : workloadsDetailRouteRef.path
        }
        element={<WorkloadDetailsPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginName}/services/:namespace/:service`
            : servicesDetailRouteRef.path
        }
        element={<ServiceDetailsPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginName}/applications/:namespace/:app`
            : appDetailRouteRef.path
        }
        element={<AppDetailsPage />}
      />
      <Route
        path={
          dev
            ? `/${pluginName}/istio/:namespace/:objectType/:object`
            : istioConfigDetailRouteRef.path
        }
        element={<IstioConfigDetailsPage />}
      />
      {dev && (
        <Route path={`/${pluginName}/kiali/entity`} element={<KialiEntity />} />
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
