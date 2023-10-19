import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const kubernetesPlugin = createPlugin({
  id: 'dynatrace-kubernetes',
  routes: {
    root: rootRouteRef,
  },
});

export const EntityKubernetesWorkload = kubernetesPlugin.provide(
  createComponentExtension({
    name: 'EntityKubernetesWorkload',
    component: {
      lazy: () =>
        import('./components/KubernetesWorkload').then(
          m => m.KubernetesWorkload,
        ),
    },
  }),
);
