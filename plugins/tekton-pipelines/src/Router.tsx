import { Entity } from '@backstage/catalog-model';
import {
  Button,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { TektonDashboardComponent } from './components/TektonDashboard';
import logger from './logging/logger';

export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR =
  'tektonci/pipeline-label-selector';

export const isTektonCiAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE]);

export const Router = (props: { refreshIntervalMs?: number }) => {
  const { entity } = useEntity();

  logger.debug(`Router entity ${JSON.stringify(entity)}`);

  const tektonPipelinesAnnotationValue =
    entity.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE];

  const tektonPipelinesLabelSelectorQueryAnnotationValue =
    entity.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR];

  logger.debug(
    `Router tektonPipelinesAnnotationValue ${tektonPipelinesAnnotationValue}`,
  );
  logger.debug(
    `Router tektonPipelinesLabelSelectorQueryAnnotationValue ${tektonPipelinesLabelSelectorQueryAnnotationValue}`,
  );

  if (
    tektonPipelinesAnnotationValue ||
    tektonPipelinesLabelSelectorQueryAnnotationValue
  ) {
    return (
   
        <Routes>
          <Route
            path="/"
            element={
              <TektonDashboardComponent
                entity={entity}
                refreshIntervalMs={props.refreshIntervalMs}
              />
            }
          />
        </Routes>
 
    );
  }

  return (
    <>
      <MissingAnnotationEmptyState
        annotation={TEKTON_PIPELINES_BUILD_NAMESPACE}
      />
      <h1>
        Or use a label selector query, which takes precedence over the previous
        annotation.
      </h1>
      <Button
        variant="contained"
        color="primary"
        href="https://backstage.io/docs/features/kubernetes/configuration#surfacing-your-kubernetes-components-as-part-of-an-entity"
        to=""
      >
        Read Kubernetes Plugin Docs
      </Button>
    </>
  );
};
