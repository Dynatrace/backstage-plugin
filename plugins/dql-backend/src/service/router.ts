import { parseCustomQueries, parseEnvironments } from '../utils/config-parser';
import { QueryExecutor } from './query-executor';
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
    const result = await queryExecutor.executeCustomQuery(
      req.params.queryId,
      req.query,
    );
    return res.json(result);
  });

  router.get('/dynatrace/kubernetes-deployments', async (req, res) => {
    const deployments = await queryExecutor.executeKubernetesDeploymentsQuery({
      componentNamespace: req.query.componentNamespace as string,
      componentName: req.query.componentName as string,
    });
    res.json(deployments);
  });

  router.use(errorHandler());
  return router;
};
