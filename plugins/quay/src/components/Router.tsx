import { Entity } from '@backstage/catalog-model';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QuayTagPage } from './QuayTagPage';
import { QuayRepository } from './QuayRepository';
import { QUAY_ANNOTATION_REPOSITORY } from '../hooks';
import { tagRouteRef } from '../routes';
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
