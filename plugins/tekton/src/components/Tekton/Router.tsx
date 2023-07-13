import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { pipelineRunRouteRef } from '../../routes';
import { PipelineRunVisualization } from '../pipeline-topology';
import { TektonComponent } from './TektonComponent';

/**
 *
 * @public
 */
export const Router = () => (
  <Routes>
    <Route path="/" element={<TektonComponent />} />
    <Route
      path={pipelineRunRouteRef.path}
      element={<PipelineRunVisualization />}
    />
  </Routes>
);
