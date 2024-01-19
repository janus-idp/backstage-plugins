import { rest } from 'msw';

const LOCAL_ADDR = 'https://localhost:4000';

export const handlers = [
  rest.post(`${LOCAL_ADDR}/api/auth/info`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/auth_info.json`)),
    );
  }),
];
