import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { imageTagRouteRef } from '../routes';
import { OcirImagesView } from './OcirImages/OcirImagesView';
import { OcirTagsTable } from './OcirTags';

export const Router = () => (
  <Routes>
    <Route path="/" element={<OcirImagesView />} />
    <Route path={imageTagRouteRef.path} element={<OcirTagsTable />} />
  </Routes>
);
