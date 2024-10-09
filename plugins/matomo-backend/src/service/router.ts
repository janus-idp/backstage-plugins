import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import type { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express, { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(options: RouterOptions): Promise<Router> {
  const { logger, config } = options;

  const matomoToken = config.getString('matomo.apiToken');
  const matomoApiUrl = config.getString('matomo.apiUrl');
  const isSecure = config.getOptionalBoolean('matomo.secure');
  if (!matomoToken || !matomoApiUrl) {
    throw new Error(
      'Missing matomo config in app-config.yaml. Add matomo.apiToken and matomo.apiUrl in config',
    );
  }

  const router = Router();
  router.use(express.urlencoded({ extended: false }));
  router.use((req, res, next) => {
    if (req.method === 'POST' && req.body) {
      const params = new URLSearchParams(req.body);
      const method = params.get('method');
      if (!method?.includes('.get')) {
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
      secure: isSecure ?? true,
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(req.body));
        proxyReq.write(req.body);
      },
      pathRewrite: {
        ['/api/matomo']: '/',
      },
    }),
  );

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
