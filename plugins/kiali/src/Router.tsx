import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import { Content, Page } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

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

export const Router = () => {
  return (
    <KialiProvider>
      <Page themeId="tool">
        <KialiHeader />
        <KialiTabs />
        <Content>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path={overviewRouteRef.path} element={<OverviewPage />} />
            <Route
              path={workloadsRouteRef.path}
              element={<WorkloadListPage />}
            />
            <Route path={servicesRouteRef.path} element={<ServiceListPage />} />
            <Route path={appsRouteRef.path} element={<AppListPage />} />
            <Route
              path={workloadsDetailRouteRef.path}
              element={<WorkloadDetailsPage />}
            />
            <Route
              path={servicesDetailRouteRef.path}
              element={<ServiceDetailsPage />}
            />
            <Route path="*" element={<KialiNoPath />} />
          </Routes>
        </Content>
      </Page>
    </KialiProvider>
  );
};
