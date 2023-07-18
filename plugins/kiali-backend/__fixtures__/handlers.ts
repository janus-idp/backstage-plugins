import { rest } from 'msw';

const LOCAL_ADDR = 'https://localhost:4000';

export const handlers = [
  rest.get(`${LOCAL_ADDR}/api/config`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [require(`${__dirname}/data/config/anonymous_config.json`)],
      }),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/istio/certs`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [require(`${__dirname}/data/config/istio_certs.json`)],
      }),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/status`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [require(`${__dirname}/data/config/status.json`)],
      }),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/mesh/tls`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [require(`${__dirname}/data/config/mesh_tls.json`)],
      }),
    );
  }),
];
