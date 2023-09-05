/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { circleCIBuildRouteRef } from '../route-refs';
import { BuildWithStepsPage } from './BuildWithStepsPage/';
import { BuildsPage } from './BuildsPage';
import { CIRCLECI_ANNOTATION } from '../constants';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';

/** @public */
export const isCircleCIAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[CIRCLECI_ANNOTATION]);

/** @public */
export const Router = () => {
  const { entity } = useEntity();

  if (!isCircleCIAvailable(entity)) {
    return <MissingAnnotationEmptyState annotation={CIRCLECI_ANNOTATION} />;
  }

  return (
    <Routes>
      <Route path="/" element={<BuildsPage />} />
      <Route
        path={`${circleCIBuildRouteRef.path}`}
        element={<BuildWithStepsPage />}
      />
    </Routes>
  );
};
