import { rest } from 'msw';

const LOCAL_ADDR = 'https://localhost:4000';

export const handlers = [
  rest.get(`${LOCAL_ADDR}/api/config`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/anonymous_config.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/istio/certs`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/istio_certs.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/status`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/status.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/mesh/tls`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/mesh_tls.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/namespaces`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/namespaces/all.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/mesh/canaries/status`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/canaries_status.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/istio/status`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/istio_status.json`)),
    );
  }),
  rest.get(
    `${LOCAL_ADDR}/api/mesh/outbound_traffic_policy/mode`,
    (_, res, ctx) => {
      return res(ctx.status(200), ctx.json({ mode: 'ALLOW_ANY' }));
    },
  ),
  rest.get(`${LOCAL_ADDR}/api/mesh/resources/thresholds`, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json({ memory: 0, cpu: 0 }));
  }),
  rest.get(`${LOCAL_ADDR}/api/istio/validations`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/namespaces/validations.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/namespaces/travel-portal/tls`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'MTLS_NOT_ENABLED',
        autoMTLSEnabled: true,
        minTLS: '',
      }),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/namespaces/travel-control/tls`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'MTLS_NOT_ENABLED',
        autoMTLSEnabled: true,
        minTLS: '',
      }),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/namespaces/travel-agency/tls`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'MTLS_NOT_ENABLED',
        autoMTLSEnabled: true,
        minTLS: '',
      }),
    );
  }),
  rest.get(
    `${LOCAL_ADDR}/api/namespaces/travel-agency/metrics`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/data/namespaces/travel-agency-metrics.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/namespaces/travel-portal/metrics`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/data/namespaces/travel-portal-metrics.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/namespaces/travel-control/metrics`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/data/namespaces/travel-control-metrics.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/namespaces/travel-agency/health`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/data/namespaces/travel-agency-health.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/namespaces/travel-portal/health`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/data/namespaces/travel-portal-health.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/namespaces/travel-control/health`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/data/namespaces/travel-control-health.json`),
        ),
      );
    },
  ),
];
