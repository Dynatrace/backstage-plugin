import { DynatraceAccessInfo, getDeployments } from './dynatrace-dql';
import { getAccessToken } from './dynatract-auth';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const url: string = config.getString('dynatrace.url');
  const tokenUrl: string = config.getString('dynatrace.tokenUrl');
  const clientId = config.getString('dynatrace.clientId');
  const clientSecret = config.getString('dynatrace.clientSecret');
  const accountUrn: string = config.getString('dynatrace.accountUrn');

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/deployments', async (req, res) => {
    const tokenResponse = await getAccessToken({
      clientId,
      clientSecret,
      tokenUrl,
      accountUrn,
    });
    const environment: DynatraceAccessInfo = {
      url,
      accessToken: tokenResponse.access_token,
    };
    const deployments = await getDeployments(
      environment,
      req.query.component as string,
    );
    res.json(deployments);
  });

  router.use(errorHandler());
  return router;
}
