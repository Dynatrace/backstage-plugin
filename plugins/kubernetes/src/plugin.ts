import { DqlQueryApiClient, dqlQueryApiRef } from './api';
import { rootRouteRef } from './routes';
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

export const dqlQueryPlugin = createPlugin({
  id: 'dynatrace-kubernetes',
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

export const EntityDqlQueryResultTableCard = dqlQueryPlugin.provide(
  createComponentExtension({
    name: 'EntityDqlQueryResultTableCard',
    component: {
      lazy: () =>
        import('./components/DqlQueryResultTable').then(
          m => m.DqlQueryResultTable,
        ),
    },
  }),
);
