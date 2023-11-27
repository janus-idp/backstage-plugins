import moment from 'moment';

import { KialiDetails } from '../service/config';

export const MILLISECONDS = 1000;
export const AUTH_KIALI_TOKEN = 'kiali-token-aes';

const timeOutforWarningUser = 60 * MILLISECONDS;

export enum AuthStrategy {
  anonymous = 'anonymous',
  openshift = 'openshift',
  token = 'token',
  openid = 'openid',
  header = 'header',
}

export interface SessionInfo {
  username?: string;
  expiresOn?: string;
}

export interface AuthConfig {
  authorizationEndpoint?: string;
  logoutEndpoint?: string;
  logoutRedirect?: string;
  strategy?: AuthStrategy;
}

export type AuthInfo = {
  sessionInfo: SessionInfo;
} & AuthConfig;

export class KialiAuthentication {
  protected cookie: string;
  protected auth: AuthInfo;
  private readonly sessionSeconds: number;

  constructor(KD: KialiDetails) {
    this.sessionSeconds = KD.sessionTime
      ? KD.sessionTime * MILLISECONDS
      : timeOutforWarningUser;
    this.auth = {
      sessionInfo: { expiresOn: '', username: 'anonymous' },
    };
    this.cookie = '';
  }

  setAuthInfo = (auth: AuthInfo) => {
    this.auth = auth;
  };

  getSession = () => {
    return this.auth;
  };

  getCookie = () => {
    return this.cookie;
  };

  setSession = (session: SessionInfo) => {
    this.auth.sessionInfo = session;
  };

  checkIfExtendSession = () => {
    return this.timeLeft() < this.sessionSeconds;
  };

  setKialiCookie = (rawCookie: string) => {
    if (rawCookie !== '') {
      const kCookie = rawCookie
        .split(';')
        .filter(n => n.split('=')[0].trim() === AUTH_KIALI_TOKEN);
      this.cookie = kCookie.length > 0 ? kCookie[0].trim() : '';
    } else {
      this.cookie = '';
    }
  };

  private timeLeft = (): number => {
    const expiresOn = moment(this.auth.sessionInfo.expiresOn);

    if (expiresOn <= moment()) {
      return -1;
    }

    return expiresOn.diff(moment());
  };

  shouldRelogin = (): boolean => {
    if (this.auth.strategy === 'anonymous') {
      return false;
    }
    if (this.cookie === '') {
      return true;
    }
    return moment(this.auth.sessionInfo.expiresOn).diff(moment()) <= 0;
  };
}
