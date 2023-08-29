import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Logger } from 'winston';

import {
  config,
  FetchResponseWrapper,
  KialiDetails,
  KialiFetchError,
} from '@janus-idp/backstage-plugin-kiali-common';

import fs from 'fs';
import https from 'https';

import { KialiAuthentication, Session } from './auth';

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

  getSession = () => {
    return this.kialiAuth.getSession();
  };

  newRequest = async <P>(endpoint: string, auth: boolean = false) => {
    return axios.request<P>(this.getRequestInit(endpoint, auth));
  };

  async checkSession(): Promise<FetchResponseWrapper> {
    const response: FetchResponseWrapper = {
      errors: [],
      warnings: [],
    };
    /*
     * Check if the actual cookie/session is valid
     */
    if (this.kialiAuth.shouldRelogin()) {
      /*
       * Verify that SA token is in the config file
       */
      if (this.KialiDetails.serviceAccountToken) {
        this.logger.debug(
          `Query to ${
            new URL(config.api.urls.authenticate, this.KialiDetails.url).href
          }`,
        );
        const params = new URLSearchParams();
        params.append('token', this.KialiDetails.serviceAccountToken || '');
        await axios
          .request<Session>(
            this.getRequestInit(config.api.urls.authenticate, true),
          )
          .then(resp => {
            const session = resp.data;
            /*
             * Store the session and cookie
             */
            this.logger.debug(`Logged username ${session.username}`);
            this.kialiAuth.setSession(session);
            this.kialiAuth.setKialiCookie(
              resp.headers['set-cookie']?.join(';') || '',
            );
          })
          .catch(err =>
            response.errors.push(this.handleUnsuccessfulResponse(err)),
          );
      } else {
        response.errors.push({
          errorType: 'NOT_FOUND',
          message: 'No service account token for Kiali',
        });
      }
      return response;
    }
    /*
     * Check if we need to extend the session
     */
    if (this.kialiAuth.checkIfExtendSession()) {
      this.logger.debug(
        `Query to ${
          new URL(config.api.urls.authenticate, this.KialiDetails.url).href
        } to extend session`,
      );
      await axios
        .request<Session>(this.getRequestInit(config.api.urls.authenticate))
        .then(resp => {
          const session = resp.data;
          /*
           * Extend the session and store it
           */
          this.logger.debug(
            `Extended session for username ${session.username}`,
          );
          this.kialiAuth.setSession(session);
          return {};
        })
        .catch(err =>
          response.errors.push(this.handleUnsuccessfulResponse(err)),
        );
    }
    /*
     * Login again is not needed
     */
    this.logger.debug(`Not need relogin`);
    return response;
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

  handleUnsuccessfulResponse(
    res: AxiosError,
    endpoint?: string,
  ): KialiFetchError {
    const message = res.message;
    const codeMessage = res.code ? `status (${res.code}) ` : '';
    const url = endpoint || res.config?.url || '';
    const urlMessage = url ? `when fetching "${url}" in "Kiali";` : '';
    this.logger.warn(`Error response axios: ${JSON.stringify(res)}`);
    this.logger.warn(
      `Received ${res.status} ${codeMessage} ${urlMessage} body=[${message}]`,
    );

    return {
      errorType: res.code || 'UNKNOWN_ERROR',
      message,
      statusCode: res.status,
      resourcePath: url,
    };
  }

  private getRequestInit = (
    endpoint: string,
    auth: boolean = false,
  ): AxiosRequestConfig => {
    const requestInit: AxiosRequestConfig = { timeout: TIMEOUT_FETCH };
    if (auth) {
      const params = new URLSearchParams();
      params.append('token', this.KialiDetails.serviceAccountToken || '');
      requestInit.headers = config.login.headers;
      requestInit.data = params;
      requestInit.method = 'post';
    } else {
      requestInit.method = 'get';
      requestInit.headers = {
        ...config.login.headers,
        cookie: this.kialiAuth.getCookie(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
    }

    requestInit.url = new URL(endpoint, this.KialiDetails.url).href;

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
}
