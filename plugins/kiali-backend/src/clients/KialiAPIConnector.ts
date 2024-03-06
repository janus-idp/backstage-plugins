import { Logger } from 'winston';

import { KialiDetails } from '../service/config';
import { KialiFetcher } from './fetch';

export type Options = {
  logger: Logger;
  kiali: KialiDetails;
};

export interface KialiApi {
  proxy(endpoint: string, method?: string): Promise<any>;
}
export class KialiApiImpl implements KialiApi {
  private kialiFetcher: KialiFetcher;
  private logger: Logger;

  constructor(options: Options) {
    this.logger = options.logger;
    options.logger.debug(`creating kiali client with url=${options.kiali.url}`);
    this.kialiFetcher = new KialiFetcher(options.kiali, options.logger);
  }

  async proxy(endpoint: string, method: string): Promise<any> {
    const authValid = await this.kialiFetcher.checkSession();
    if (authValid.verify) {
      this.logger.debug(
        `Authenticated user : ${
          this.kialiFetcher.getAuthData().sessionInfo.username
        }`,
      );
      return this.kialiFetcher
        .newRequest<any>(endpoint, false, method)
        .then(resp => resp.data);
    }
    this.logger.debug(
      `Authentication failed : ${
        authValid.missingAttributes &&
        `Missing attributes: [${authValid.missingAttributes?.join(',')}] .`
      } ${authValid.message}`,
    );
    return Promise.resolve(authValid);
  }

  async status(): Promise<any> {
    const authValid = await this.kialiFetcher.checkSession();
    if (authValid.verify) {
      return this.kialiFetcher
        .newRequest<any>('api/status')
        .then(resp => resp.data);
    }
    return Promise.resolve(authValid);
  }
}
