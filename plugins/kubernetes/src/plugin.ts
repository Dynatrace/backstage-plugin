import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const kubernetesPlugin = createPlugin({
  id: 'kubernetes',
  routes: {
    root: rootRouteRef,
  },
});

export const KubernetesPage = kubernetesPlugin.provide(
  createRoutableExtension({
    name: 'KubernetesPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
