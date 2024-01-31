import { rest } from 'msw';

const LOCAL_ADDR = 'https://localhost:4000';

export const handlers = [
  rest.get(`${LOCAL_ADDR}/api/status`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/status.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/auth/info`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/auth_info.json`)),
    );
  }),
  rest.post(`${LOCAL_ADDR}/api/authenticate`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/authenticated.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/namespaces`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/namespaces.json`)),
    );
  }),
];
