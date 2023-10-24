import { PluginEnvironment } from '../types';
import { createRouter } from '@dynatrace/backstage-plugin-kubernetes-backend';
import { Router } from 'express';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
