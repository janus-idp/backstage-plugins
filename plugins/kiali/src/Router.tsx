import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import {
  Content,
  MissingAnnotationEmptyState,
  Page,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Button } from '@material-ui/core';

import { KialiNoPath } from './pages/Kiali';
import { KialiHeader } from './pages/Kiali/Header/KialiHeader';
import { KialiHeaderEntity } from './pages/Kiali/Header/KialiHeaderEntity';
import { KialiTabs } from './pages/Kiali/Header/KialiTabs';
import { KialiEntity } from './pages/Kiali/KialiEntity';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { WorkloadListPage } from './pages/WorkloadList/WorkloadListPage';
import { KialiProvider } from './store/KialiProvider';

export const KUBERNETES_ANNOTATION = 'backstage.io/kubernetes-id';
export const KUBERNETES_NAMESPACE = 'backstage.io/kubernetes-namespace';
export const KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

const validateAnnotation = (entity: Entity) => {
  return (
    Boolean(entity.metadata.annotations?.[KUBERNETES_NAMESPACE]) ||
    Boolean(entity.metadata.annotations?.[KUBERNETES_ANNOTATION]) ||
    Boolean(
      entity.metadata.annotations?.[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION],
    )
  );
};

/*
  Router for entity
*/

export const EmbeddedRouter = () => {
  const { entity } = useEntity();
  if (!validateAnnotation(entity)) {
    return (
      <>
        <MissingAnnotationEmptyState annotation={KUBERNETES_ANNOTATION} />
        <h1>
          Or use a label selector query, which takes precedence over the
          previous annotation.
        </h1>
        <Button variant="contained" color="primary" href="#">
          Read Kiali Plugin Docs
        </Button>
      </>
    );
  }

  return (
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
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/workloads" element={<WorkloadListPage />} />
            <Route path="*" element={<KialiNoPath />} />
          </Routes>
        </Content>
      </Page>
    </KialiProvider>
  );
};
