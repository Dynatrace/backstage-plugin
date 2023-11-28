import { DqlQueryApiClient, dqlQueryApiRef } from './api';
import { rootRouteRef } from './routes';
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

export const dqlQueryPlugin = createPlugin({
  id: 'dynatrace-dql',
  apis: [
    createApiFactory({
      api: dqlQueryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new DqlQueryApiClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EntityDqlQueryCard = dqlQueryPlugin.provide(
  createComponentExtension({
    name: 'EntityDqlQueryCard',
    component: {
      lazy: () => import('./components').then(m => m.DqlQuery),
    },
  }),
);

export const EntityKubernetesDeploymentsCard = dqlQueryPlugin.provide(
  createComponentExtension({
    name: 'EntityKubernetesDeploymentsCard',
    component: {
      lazy: () => import('./components').then(m => m.KubernetesDeployments),
    },
  }),
);
