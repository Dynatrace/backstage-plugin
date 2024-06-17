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
import { parseCustomQueries, parseEnvironments } from '../utils/configParser';
import { getEntityFromRequest } from '../utils/routeUtils';
import { QueryExecutor } from './queryExecutor';
import {
  createLegacyAuthAdapters,
  errorHandler,
} from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { PluginEndpointDiscovery } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  discovery: PluginEndpointDiscovery;
  auth?: AuthService;
}

export const createRouter = async (
  options: RouterOptions,
): Promise<express.Router> => {
  // In order to make the new auth services available to the plugin
  // implementation in a backwards compatible way, we use the
  // createLegacyAuthAdapters helper from @backstage/backend-common.
  // Ref: https://backstage.io/docs/tutorials/auth-service-migration/#making-the-new-auth-services-available-in-createrouter
  const { auth } = createLegacyAuthAdapters(options);

  const { config, discovery } = options;

  const apis = parseEnvironments(config);
  const customQueries = parseCustomQueries(config);
  const queryExecutor = new QueryExecutor(apis, customQueries);
  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  const router = Router();
  router.use(express.json());

  router.get('/custom/:queryId', async (req, res) => {
    const entity = await getEntityFromRequest(req, catalogClient, auth);
    const result = await queryExecutor.executeCustomQuery(req.params.queryId, {
      componentNamespace: entity.metadata.namespace ?? 'default',
      componentName: entity.metadata.name,
    });
    return res.json(result);
  });

  router.get('/dynatrace/:queryId', async (req, res) => {
    const entity = await getEntityFromRequest(req, catalogClient, auth);
    const deployments = await queryExecutor.executeDynatraceQuery(
      req.params.queryId,
      entity,
    );
    res.json(deployments);
  });

  router.use(errorHandler());
  return router;
};
