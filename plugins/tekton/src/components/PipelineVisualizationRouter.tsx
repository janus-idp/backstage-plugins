import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TEKTON_CI_ANNOTATION } from '../consts/tekton-const';
import { LatestPipelineRunVisualization } from './pipeline-topology';

/** @public */
export const isTektonCIAvailable = (entity: Entity): boolean =>
  entity.metadata.annotations?.[TEKTON_CI_ANNOTATION] === 'true';

/** @public */
export const PipelineVisualizationRouter = () => {
  const { entity } = useEntity();
  if (isTektonCIAvailable(entity)) {
    return (
      <Routes>
        <Route path="/" element={<LatestPipelineRunVisualization />} />
      </Routes>
    );
  }
  return null;
};
