import moment from 'moment';
import fetch, { Response } from 'node-fetch';
import { Logger } from 'winston';

import { config, KialiDetails } from '@janus-idp/backstage-plugin-kiali-common';

type Authentication = {
  expiresOn: string;
  username: string;
};

const MILLISECONDS = 1000;
const AUTH_KIALI_TOKEN = 'kiali-token-aes';
export class KialiAuthentication {
  protected session: Authentication;
  protected cookie: string;
  private KialiDetails: KialiDetails;
  private readonly logger: Logger;
  private readonly sessionSeconds: number;

  constructor(KD: KialiDetails, log: Logger) {
    this.KialiDetails = KD;
    this.logger = log;
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

  setSession = (session: Authentication) => {
    this.session = session;
  };

  checkSession = () => {
    if (this.timeLeft() < this.sessionSeconds) {
      this.extendSession();
    }
  };

  setKialiCookie = (response: Response) => {
    const rawCookie = response.headers.get('set-cookie') || '';
    if (rawCookie !== '') {
      const kCookie = rawCookie
        .split(';')
        .filter(n => n.split('=')[0] === AUTH_KIALI_TOKEN);
      this.cookie = kCookie.length > 0 ? kCookie[0] : '';
    } else {
      this.cookie = '';
    }
  };

  private extendSession() {
    fetch('').then(resp => {
      this.logger.info(`Extend session ${resp}`);
      // this.session.expiresOn = resp.expiresOn
    });
  }
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
    return moment(this.session!.expiresOn).diff(moment()) > 0;
  };
}
