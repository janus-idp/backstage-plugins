import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OcrPage } from './OcrPage';
import { OcrImage } from './OcrImage';
import { imageRouteRef } from '../routes';

/**
 *
 * @public
 */
export const Router = () => (
  <Routes>
    <Route path="/" element={<OcrPage />} />
    <Route path={imageRouteRef.path} element={<OcrImage />} />
  </Routes>
);
