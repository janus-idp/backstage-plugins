import { Logger } from 'winston';

import { Paths } from '../../openapi.d';
import { HandlerResponse } from './handlers';

export async function ping(
  logger: Logger,
): Promise<HandlerResponse<Paths.Ping.Responses.$200>> {
  logger.debug('PONG!');
  return {
    statusCode: 200,
    responseBody: { status: 'ok' },
  };
}
