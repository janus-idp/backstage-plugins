import {createPlugin, createRoutableExtension,} from '@backstage/core-plugin-api';
import {newProjectRouteRef, projectsRouteRef, rootRouteRef} from './routes';

export const orionPlugin = createPlugin({
    id: 'parodos',
    routes: {
        root: rootRouteRef,
        newproject: newProjectRouteRef,
        projects: projectsRouteRef,
    },
});

export const OrionPage = orionPlugin.provide(
  createRoutableExtension({
    name: 'OrionPage',
    component: () =>
        import('./components/App').then(
            m => m.App,
        ),
    mountPoint: rootRouteRef,
  }),
);
