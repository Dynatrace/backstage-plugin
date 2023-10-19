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

export const EntityKubernetesWorkloadCard = kubernetesPlugin.provide(
  createComponentExtension({
    name: 'EntityKubernetesWorkloadCard',
    component: {
      lazy: () =>
        import('./components/KubernetesWorkload').then(
          m => m.KubernetesWorkload,
        ),
    },
  }),
);
