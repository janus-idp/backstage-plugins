import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Button } from '@material-ui/core';

import { KialiNoPath, KialiPage } from './pages/Kiali';
import { KialiProvider } from './store/KialiProvider';

export const KUBERNETES_ANNOTATION = 'backstage.io/kubernetes-id';
export const KUBERNETES_NAMESPACE = 'backstage.io/kubernetes-namespace';

export const KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

export const isKubernetesAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[KUBERNETES_ANNOTATION]) ||
  Boolean(
    entity.metadata.annotations?.[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION],
  );

export const Router = () => {
  const { entity } = useEntity();
  const kubernetesAnnotationValue =
    entity.metadata.annotations?.[KUBERNETES_ANNOTATION];

  const kubernetesNamespaceValue =
    entity.metadata.annotations?.[KUBERNETES_NAMESPACE];

  const kubernetesLabelSelectorQueryAnnotationValue =
    entity.metadata.annotations?.[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION];

  if (
    kubernetesAnnotationValue ||
    kubernetesNamespaceValue ||
    kubernetesLabelSelectorQueryAnnotationValue
  ) {
    return (
      <KialiProvider>
        <Routes>
          <Route path="/" element={<KialiPage />} />
          <Route path="/overview" element={<KialiPage />} />
          <Route path="*" element={<KialiNoPath />} />
        </Routes>
      </KialiProvider>
    );
  }

  return (
    <>
      <MissingAnnotationEmptyState annotation={KUBERNETES_ANNOTATION} />
      <h1>
        Or use a label selector query, which takes precedence over the previous
        annotation.
      </h1>
      <Button variant="contained" color="primary" href="#">
        Read Kiali Plugin Docs
      </Button>
    </>
  );
};
