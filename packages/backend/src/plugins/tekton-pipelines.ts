import { createRouter } from '@jquad-group/plugin-tekton-pipelines-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {

  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}