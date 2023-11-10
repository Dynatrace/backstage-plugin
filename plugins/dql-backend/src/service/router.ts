import { DynatraceApi } from './dynatrace-api';
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
  const api = new DynatraceApi(config.get('dynatrace'));

  const router = Router();
  router.use(express.json());

  router.get('/custom/:queryId', async (req, res) => {
    const query = config.getString(`dynatrace.queries.${req.params.queryId}`);
    const result = await api.executeDqlQuery(query);
    res.json(result);
  });

  router.get('/dynatrace/kubernetes-deployments', async (req, res) => {
    const query = `
    fetch dt.entity.cloud_application
    | fields name = entity.name, namespace.id = belongs_to[dt.entity.cloud_application_namespace], backstageComponent = cloudApplicationLabels[\`backstage.io/component\`]
    | filter backstageComponent == "${req.query.component as string}"
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, Namespace = entity.name], sourceField:namespace.id, lookupField:id, fields:{namespace = Namespace}
  `;
    const deployments = await api.executeDqlQuery(query);

    res.json(deployments);
  });

  router.use(errorHandler());
  return router;
};
