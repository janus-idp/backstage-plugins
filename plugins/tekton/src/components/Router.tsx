import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';

import { TEKTON_CI_ANNOTATION } from '../consts/tekton-const';
import { TektonCIComponent } from './Tekton/TektonCIComponent';

/** @public */
export const isTektonCIAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[TEKTON_CI_ANNOTATION]);

/** @public */
export const Router = () => {
  const { entity } = useEntity();
  if (isTektonCIAvailable(entity)) {
    return (
      <Routes>
        <Route path="/" element={<TektonCIComponent />} />
      </Routes>
    );
  }
  return null;
};
