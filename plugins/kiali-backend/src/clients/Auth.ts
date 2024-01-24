import moment from 'moment';

import { KialiDetails } from '../service/config';

export const MILLISECONDS = 1000;
export const AUTH_KIALI_TOKEN = 'kiali-token-aes';

export const timeOutforWarningUser = 60 * MILLISECONDS;

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
  private readonly sessionMilliSeconds: number;

  constructor(KD: KialiDetails) {
    this.sessionMilliSeconds = KD.sessionTime
      ? KD.sessionTime * MILLISECONDS
      : timeOutforWarningUser;
    this.auth = {
      sessionInfo: { expiresOn: '', username: 'anonymous' },
    };
    this.cookie = '';
  }

  /*
    Store Auth Information
  */
  setAuthInfo = (auth: AuthInfo) => {
    this.auth = auth;
  };

  getSession = () => {
    return this.auth;
  };

  getSecondsSession = () => {
    return this.sessionMilliSeconds;
  };

  getCookie = () => {
    return this.cookie;
  };

  /*
    Store session
  */
  setSession = (session: SessionInfo) => {
    this.auth.sessionInfo = session;
  };

  /*
    Parse kiali token with key AUTH_KIALI_TOKEN from headers and store
  */
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

  /*
    Calculate the time feft until the session expires
  */
  private timeLeft = (): number => {
    const expiresOn = moment(this.auth.sessionInfo.expiresOn);
    if (expiresOn <= moment()) {
      return -1;
    }
    return expiresOn.diff(moment());
  };

  /*
    Check if user should relogin due the timeLeft
  */
  shouldRelogin = (): boolean => {
    if (this.auth.strategy === 'anonymous') {
      return false;
    }
    if (this.cookie === '') {
      return true;
    }
    const timeLeft = this.timeLeft();
    return timeLeft <= 0 || timeLeft < this.sessionMilliSeconds;
  };
}
