import fetch, { RequestInit, Response } from 'node-fetch';
import { Logger } from 'winston';

import {
  config,
  KialiDetails,
  KialiErrorTypes,
  KialiFetchError,
} from '@janus-idp/backstage-plugin-kiali-common';

import fs from 'fs';
import https from 'https';

import { KialiAuthentication } from './auth';

const TIMEOUT_FETCH = 8000;
const statusCodeToErrorType = (statusCode: number): KialiErrorTypes => {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED_ERROR';
    case 404:
      return 'NOT_FOUND';
    case 500:
      return 'SYSTEM_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    case 504:
      return 'GATEWAY_TIME_OUT';
    default:
      return 'UNKNOWN_ERROR';
  }
};

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

  async checkSession(): Promise<Response> {
    if (this.kialiAuth.shouldRelogin()) {
      if (this.KialiDetails.serviceAccountToken) {
        this.logger.debug(
          `Query to ${
            new URL(config.api.urls.authenticate, this.KialiDetails.url).href
          }`,
        );
        const auth = await fetch(
          new URL(config.api.urls.authenticate, this.KialiDetails.url).href,
          this.getRequestInit(true),
        );
        if (auth.ok) {
          const session = await auth.json();
          this.logger.debug(`Logged username ${session.username}`);
          this.kialiAuth.setSession(session);
          this.kialiAuth.setKialiCookie(auth.headers.get('set-cookie') || '');
        }
        return auth;
      }

      return Promise.reject(new Error('No service account token for Kiali'));
    }
    // Check if need extend session
    if (this.kialiAuth.checkIfExtendSession()) {
      this.logger.debug(
        `Query to ${
          new URL(config.api.urls.authenticate, this.KialiDetails.url).href
        } to extend session`,
      );
      const auth = await this.fetchResource(
        new URL(config.api.urls.authenticate, this.KialiDetails.url).href,
        this.getRequestInit(),
      );
      if (auth.ok) {
        const session = await auth.json();
        this.logger.debug(`Extended session for username ${session.username}`);
        this.kialiAuth.setSession(session);
      }
      return auth;
    }
    this.logger.debug(`Not need relogin`);
    return Promise.resolve(new Response('No need login'));
  }
  async fetchResource(
    endpoint: string,
    request: RequestInit = this.getRequestInit(),
  ): Promise<Response> {
    const auth = await this.checkSession();
    if (auth.ok) {
      this.logger.info(
        `Query to ${new URL(endpoint, this.KialiDetails.url).href}`,
      );
      return fetch(new URL(endpoint, this.KialiDetails.url).href, request);
    }
    return auth;
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

  async handleUnsuccessfulResponse(res: Response): Promise<KialiFetchError> {
    const resourcePath = new URL(res.url).pathname;
    const message = await res.text();
    this.logger.warn(
      `Received ${res.status} status when fetching "${this.KialiDetails.url}${resourcePath}" in "Kiali"; body=[${message}]`,
    );
    return {
      errorType: statusCodeToErrorType(res.status),
      message: message,
      statusCode: res.status,
      resourcePath,
    };
  }

  private getRequestInit = (auth: boolean = false): RequestInit => {
    const requestInit: RequestInit = { timeout: TIMEOUT_FETCH };
    if (auth) {
      const params = new URLSearchParams();
      params.append('token', this.KialiDetails.serviceAccountToken || '');
      requestInit.headers = config.login.headers;
      requestInit.method = 'post';
      requestInit.body = params;
    } else {
      requestInit.headers = {
        ...config.login.headers,
        cookie: this.kialiAuth.getCookie(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
    }

    if (this.KialiDetails.skipTLSVerify) {
      requestInit.agent = new https.Agent({
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
