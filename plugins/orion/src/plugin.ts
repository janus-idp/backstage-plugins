import {createPlugin, createRoutableExtension,} from '@backstage/core-plugin-api';
import {projectOverviewRouteRef, workflowRouteRef, notificationRouteRef, trainingRouteRef, rootRouteRef} from './routes';

export const orionPlugin = createPlugin({
    id: 'parodos',
    routes: {
        root: rootRouteRef,
        projectOverview: projectOverviewRouteRef,
        workflow: workflowRouteRef,
        notification: notificationRouteRef,
        training: trainingRouteRef,
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
