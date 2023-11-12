import { DynatraceApi, DynatraceEnvironmentConfig } from './dynatrace-api';
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

export const createRouter = async (
  options: RouterOptions,
): Promise<express.Router> => {
  const { config } = options;
  const apis = config
    .getConfigArray('dynatrace.environments')
    .map(
      envConfig =>
        new DynatraceApi(envConfig.get<DynatraceEnvironmentConfig>()),
    );
  const queryExecutor = new QueryExecutor(
    apis,
    config.getOptional('dynatrace.queries') ?? {},
  );

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
    const deployments = await queryExecutor.executeKubernetesDeploymensQuery({
      componentNamespace: req.query.componentNamespace as string,
      componentName: req.query.componentName as string,
    });
    res.json(deployments);
  });

  router.use(errorHandler());
  return router;
};
