import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { imageRouteRef, rootRouteRef } from './routes';

export const ocrPlugin = createPlugin({
  id: 'ocr',
  routes: {
    root: rootRouteRef,
    image: imageRouteRef,
  },
});

export const OcrPage = ocrPlugin.provide(
  createRoutableExtension({
    name: 'OcrPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
