import { KubernetesWorkloadApiClient, kubernetesWorkloadApiRef } from './api';
import { rootRouteRef } from './routes';
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

export const kubernetesPlugin = createPlugin({
  id: 'dynatrace-kubernetes',
  apis: [
    createApiFactory({
      api: kubernetesWorkloadApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) =>
        new KubernetesWorkloadApiClient({ discoveryApi }),
    }),
  ],
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
