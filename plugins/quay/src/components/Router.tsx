import { Entity } from '@backstage/catalog-model';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QuayDashboardPage } from './QuayDashboardPage';
import { QuayTagPage } from './QuayTagPage';
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
export const Router = () => {
  // eslint-disable-next-line no-console
  console.log('attempting to render router');
  return (
    <Routes>
      <Route path="/" element={<QuayDashboardPage />} />
      <Route path={tagRouteRef.path} element={<QuayTagPage />} />
    </Routes>
  );
};
