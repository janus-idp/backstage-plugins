import moment from 'moment';

import { config, KialiDetails } from '@janus-idp/backstage-plugin-kiali-common';

export type Session = {
  expiresOn: string;
  username: string;
};

export const MILLISECONDS = 1000;
export const AUTH_KIALI_TOKEN = 'kiali-token-aes';
export class KialiAuthentication {
  protected session: Session;
  protected cookie: string;
  private KialiDetails: KialiDetails;
  private readonly sessionSeconds: number;

  constructor(KD: KialiDetails) {
    this.KialiDetails = KD;
    this.sessionSeconds = KD.sessionTime
      ? KD.sessionTime * MILLISECONDS
      : config.session.timeOutforWarningUser;
    this.session = { expiresOn: '', username: 'anonymous' };
    this.cookie = '';
  }

  getSession = () => {
    return this.session;
  };

  getCookie = () => {
    return this.cookie;
  };

  setSession = (session: Session) => {
    this.session = session;
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
    const expiresOn = moment(this.session!.expiresOn);

    if (expiresOn <= moment()) {
      return -1;
    }

    return expiresOn.diff(moment());
  };

  shouldRelogin = (): boolean => {
    if (this.KialiDetails.strategy === 'anonymous') {
      return false;
    }
    if (this.cookie === '') {
      return true;
    }
    return moment(this.session!.expiresOn).diff(moment()) <= 0;
  };
}
