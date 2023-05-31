import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';

import { QUAY_ANNOTATION_REPOSITORY } from '../hooks';
import { tagRouteRef } from '../routes';
import { QuayRepository } from './QuayRepository';
import { QuayTagPage } from './QuayTagPage';

/** *
 * @public
 */
export const isQuayAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY]);
/**
 *
 * @public
 */
export const Router = () => (
  <Routes>
    <Route path="/" element={<QuayRepository />} />
    <Route path={tagRouteRef.path} element={<QuayTagPage />} />
  </Routes>
);
