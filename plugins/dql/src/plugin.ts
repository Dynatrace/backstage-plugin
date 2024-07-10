/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

export const EntityCatalogInfoQueryCard = dqlQueryPlugin.provide(
  createComponentExtension({
    name: 'EntityCatalogInfoQueryCard',
    component: {
      lazy: () => import('./components').then(m => m.CatalogInfoQuery),
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

export const EntitySrgValidationsCard = dqlQueryPlugin.provide(
  createComponentExtension({
    name: 'EntitySrgValidationsCard',
    component: {
      lazy: () => import('./components').then(m => m.SrgValidatons),
    },
  }),
);
