/* Copyright [2024] [Dynatrace]
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.*/
import { parseCustomQueries, parseEnvironments } from '../utils/configParser';
import { QueryExecutor } from './queryExecutor';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

export type RouterOptions = {
  logger: Logger;
  config: Config;
};

export const createRouter = async ({
  config,
}: RouterOptions): Promise<express.Router> => {
  const apis = parseEnvironments(config);
  const customQueries = parseCustomQueries(config);
  const queryExecutor = new QueryExecutor(apis, customQueries);

  const router = Router();
  router.use(express.json());

  router.get('/custom/:queryId', async (req, res) => {
    const result = await queryExecutor.executeCustomQuery(req.params.queryId, {
      componentNamespace: req.query.componentNamespace as string,
      componentName: req.query.componentName as string,
    });
    return res.json(result);
  });

  router.get('/dynatrace/:queryId', async (req, res) => {
    const deployments = await queryExecutor.executeDynatraceQuery(
      req.params.queryId,
      {
        componentNamespace: req.query.componentNamespace as string,
        componentName: req.query.componentName as string,
      },
    );
    res.json(deployments);
  });

  router.use(errorHandler());
  return router;
};
