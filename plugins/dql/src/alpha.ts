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
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import React from 'react';
import { z } from 'zod';

const dqlQueryApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: dqlQueryApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new DqlQueryApiClient({ discoveryApi }),
    }),
});

const entityDqlQueryCard = EntityCardBlueprint.makeWithOverrides({
  name: 'dql-query',
  configSchema: {
    props: z
      .object({
        title: z.string().default('Query Result'),
        queryId: z.string(),
        pageSize: z.number().optional(),
      })
      .default({ title: 'Query Result', queryId: '' }),
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      loader: async () =>
        import('./components').then(m =>
          React.createElement(m.DqlQuery, {
            title: config.props.title,
            queryId: config.props.queryId,
            pageSize: config.props.pageSize,
          }),
        ),
    });
  },
});

const entityCatalogInfoQueryCard = EntityCardBlueprint.makeWithOverrides({
  name: 'catalog-info-query',
  configSchema: {
    props: z
      .object({
        pageSize: z.number().optional(),
      })
      .default({}),
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      loader: async () =>
        import('./components').then(m =>
          React.createElement(m.CatalogInfoQuery, {
            pageSize: config.props.pageSize,
          }),
        ),
    });
  },
});

const entityKubernetesDeploymentsCard = EntityCardBlueprint.makeWithOverrides({
  name: 'kubernetes-deployments',
  configSchema: {
    props: z
      .object({
        title: z.string().default('Kubernetes Deployments'),
        pageSize: z.number().optional(),
      })
      .default({ title: 'Kubernetes Deployments' }),
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      loader: async () =>
        import('./components/kubernetes').then(m =>
          React.createElement(m.KubernetesDeployments, {
            title: config.props.title,
            pageSize: config.props.pageSize,
          }),
        ),
    });
  },
});

/**
 * The Dynatrace DQL plugin for the new Backstage frontend system.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'dynatrace-dql',
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
  extensions: [
    dqlQueryApi,
    entityDqlQueryCard,
    entityCatalogInfoQueryCard,
    entityKubernetesDeploymentsCard,
  ],
});
