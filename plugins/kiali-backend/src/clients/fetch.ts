import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Logger } from 'winston';

import fs from 'fs';
import https from 'https';

import { KialiDetails } from '../service/config';
import {
  AuthInfo,
  AuthStrategy,
  KialiAuthentication,
  SessionInfo,
} from './Auth';

export type AuthValid = {
  verify: boolean;
  missingAttributes?: string[];
  message?: string;
  helper?: string;
  authData?: AuthInfo;
};

const TIMEOUT_FETCH = 8000;
export class KialiFetcher {
  private readonly logger: Logger;
  private kialiAuth: KialiAuthentication;
  private KialiDetails: KialiDetails;

  constructor(KD: KialiDetails, log: Logger) {
    this.KialiDetails = KD;
    this.logger = log;
    this.kialiAuth = new KialiAuthentication(KD);
  }

  newRequest = async <P>(
    endpoint: string,
    auth: boolean = false,
    method?: string,
  ) => {
    this.logger.info(`Query to ${endpoint}`);
    return axios.request<P>(this.getRequestInit(endpoint, auth, method));
  };

  private async getAuthInfo(): Promise<AuthInfo> {
    return this.newRequest<AuthInfo>('api/auth/info').then(resp => resp.data);
  }

  getAuthData(): AuthInfo {
    return this.kialiAuth.getSession();
  }

  private validateConfiguration = (auth: AuthInfo): AuthValid => {
    const result: AuthValid = {
      verify: true,
      authData: auth,
    };
    switch (auth.strategy) {
      case AuthStrategy.anonymous:
        break;
      case AuthStrategy.token: {
        if (
          !this.KialiDetails.serviceAccountToken ||
          this.KialiDetails.serviceAccountToken === ''
        ) {
          result.verify = false;
          result.message = `Attribute 'serviceAccountToken' is not in the backstage configuration`;
          result.helper = `For more information follow the steps in https://janus-idp.io/plugins/kiali`;
          result.missingAttributes = ['serviceAccountToken'];
        }
        break;
      }
      default:
        result.verify = false;
        result.message = `Strategy ${auth.strategy} is not supported in Kiali backstage plugin yet`;
        break;
    }

    return result;
  };

  async checkSession(): Promise<AuthValid> {
    let checkAuth: AuthValid = { verify: true };
    /*
     * Get/Update AuthInformation from /api/auth/info
     */

    const auth = await this.getAuthInfo();
    this.kialiAuth.setAuthInfo(auth);
    this.logger.info(`AuthInfo: ${JSON.stringify(auth)}`);
    /*
     * Check Configuration
     */
    checkAuth = this.validateConfiguration(auth);
    /*
     * Check if the actual cookie/session is valid and if the configuration is right
     */
    if (checkAuth.verify && this.kialiAuth.shouldRelogin()) {
      this.logger.info(`User must relogin`);
      await this.newRequest<AuthInfo>('api/authenticate', true)
        .then(resp => {
          const session = resp.data as SessionInfo;
          this.kialiAuth.setSession(session);
          this.kialiAuth.setKialiCookie(
            resp.headers['set-cookie']?.join(';') || '',
          );
          this.logger.info(`User ${session.username} logged in kiali plugin`);
        })
        .catch(err => {
          checkAuth.verify = false;
          checkAuth.message = this.handleUnsuccessfulResponse(err);
        });
    }
    return checkAuth;
  }

  private bufferFromFileOrString(file?: string, data?: string): Buffer | null {
    if (file) {
      return fs.readFileSync(file);
    }
    if (data) {
      return Buffer.from(data, 'base64');
    }
    return null;
  }

  private getRequestInit = (
    endpoint: string,
    auth: boolean = false,
    method?: string,
  ): AxiosRequestConfig => {
    const requestInit: AxiosRequestConfig = { timeout: TIMEOUT_FETCH };
    const headers = { 'X-Auth-Type-Kiali-UI': '1' };

    /*
      Check if is an authentication request to add the serviceAccountToken
    */
    if (auth) {
      const params = new URLSearchParams();
      params.append('token', this.KialiDetails.serviceAccountToken || '');
      requestInit.headers = headers;
      requestInit.data = params;
      requestInit.method = 'post';
    } else {
      requestInit.method = method ? method : 'get';
      requestInit.headers = {
        ...headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        cookie: this.kialiAuth.getCookie(),
      };
    }
    /*
      kialiDetails.utl is formatted to make sure it ends in '/'
      We check that endpoint does not begin with '/'
    */
    const loginUrl = `${this.KialiDetails.url}${endpoint.replace(/^\//g, '')}`;
    requestInit.url = new URL(loginUrl).href;

    if (this.KialiDetails.skipTLSVerify) {
      requestInit.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        ca:
          this.bufferFromFileOrString(
            this.KialiDetails.caFile,
            this.KialiDetails.caData,
          ) ?? undefined,
      });
    }
    return requestInit;
  };

  private handleUnsuccessfulResponse(
    res: AxiosError,
    endpoint?: string,
  ): string {
    const message = res.message;
    const url = endpoint || res.config?.url || '';
    const urlMessage = url ? `when fetching "${url}" in "Kiali";` : '';
    return `[${
      res.code || 'UNKNOWN_ERROR'
    }] Fetching ${urlMessage} body=[${message}]`;
  }
}
