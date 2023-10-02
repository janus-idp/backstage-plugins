import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';

import express from 'express';
import Router from 'express-promise-router';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from 'winston';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config } = options;

  const matomoToken = config.getString('matomo.apiToken');
  const matomoApiUrl = config.getString('matomo.apiUrl');
  if (!matomoToken || !matomoApiUrl) {
    throw new Error(
      'Missing matomo config in app-config.yaml. Add matomo.apiToken and apiUrl in config',
    );
  }

  const router = Router();
  router.use(express.urlencoded({ extended: false }));
  router.use((req, res, next) => {
    if (req.method === 'POST' && req.body) {
      const params = new URLSearchParams(req.body);
      const method = params.get('method');
      if (!method || !method.includes('.get')) {
        res.status(400).json({ message: 'read only operation' });
        return;
      }
      params.set('token_auth', matomoToken);
      req.body = params.toString();
    }
    next();
  });

  router.use(
    '/',
    createProxyMiddleware({
      target: matomoApiUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(req.body));
        proxyReq.write(req.body);
      },
      pathRewrite: {
        '^/api/matomo': '/',
      },
    }),
  );

  router.use(errorHandler());
  return router;
}
