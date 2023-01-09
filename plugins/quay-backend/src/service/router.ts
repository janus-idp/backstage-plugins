import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { getManifestByDigest, getTags, ManifestByDigestResponse, TagsResponse } from './tag';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  logger.info('Initializing quay backend');
  const baseUrl = config.getString('quay.baseUrl');
  const token = config.getString('quay.token');

  const router = Router();
  router.use(express.json());

  router.get('/tag', async (request, response) => {
    const org: any = request.query.org
    const repo: any = request.query.repo

    const tags: TagsResponse = await getTags(
      baseUrl,
      token,
      //username,
      //password,
      org,
      repo,
      1,
      100
    )

    response.send(tags)
  })

  router.get('/manifestByDigest', async (request, response) => {
    const org: any = request.query.org
    const repo: any = request.query.repo
    const manifest: any = request.query.manifest

    const manifests: ManifestByDigestResponse = await getManifestByDigest(
      baseUrl,
      token,
      //username,
      //password,
      org,
      repo,
      manifest
    )

    response.send(manifests)
  })

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
