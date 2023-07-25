import moment from 'moment';

import { config } from '@janus-idp/backstage-plugin-kiali-common';

import {
  AUTH_KIALI_TOKEN,
  KialiAuthentication,
  MILLISECONDS,
  Session,
} from './auth';

const kialiURL = 'https://localhost:4000';
const tomorrow = moment().add(1, 'days');
const yesterday = moment().subtract(1, 'days');

describe('createRouter', () => {
  describe('KialiAuthentication constructor', () => {
    it('returns values for KialiAuthentication', () => {
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
      });

      expect(kialiAuth.getSession()).toEqual({
        expiresOn: '',
        username: 'anonymous',
      });
      expect(kialiAuth.getCookie()).toEqual('');
      // eslint-disable-next-line
      expect(kialiAuth['sessionSeconds']).toEqual(
        config.session.timeOutforWarningUser,
      );
    });

    it('with a specific sessionTime', () => {
      const sessionSeconds = 500;
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
        sessionTime: sessionSeconds,
      });
      // eslint-disable-next-line
      expect(kialiAuth['sessionSeconds']).toEqual(500 * MILLISECONDS);
    });
  });
  describe('KialiAuthentication set', () => {
    it('session set', () => {
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
      });
      expect(kialiAuth.getSession()).toEqual({
        expiresOn: '',
        username: 'anonymous',
      });
      const session: Session = {
        expiresOn: tomorrow.toISOString(),
        username: 'kiali',
      };
      kialiAuth.setSession(session);
      expect(kialiAuth.getSession()).toEqual(session);
    });

    it('Cookie set', async () => {
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
      });
      expect(kialiAuth.getCookie()).toEqual('');

      const cookieKiali = `${AUTH_KIALI_TOKEN}=kiali-cookie-token`;
      const cookie = `d5b5278d6ecca213a6cda3f6cfaa8cef=d0f2b7c7d1dd95460bc1764814f35468; ${cookieKiali} ; date=today`;
      kialiAuth.setKialiCookie(cookie);
      expect(kialiAuth.getCookie()).toEqual(cookieKiali);
    });

    it('Cookie set to empty', async () => {
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
      });
      expect(kialiAuth.getCookie()).toEqual('');

      const wrongCookieKiali = `${AUTH_KIALI_TOKEN}error=kiali-cookie-token`;
      const cookie = `d5b5278d6ecca213a6cda3f6cfaa8cef=d0f2b7c7d1dd95460bc1764814f35468; ${wrongCookieKiali} ; date=today`;
      kialiAuth.setKialiCookie(cookie);
      expect(kialiAuth.getCookie()).toEqual('');
    });
  });

  describe('Should relogin', () => {
    it('should be false if strategy is anonymous', () => {
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
      });
      expect(kialiAuth.shouldRelogin()).toBeFalsy();
    });

    it('should be true if strategy is not anonymous and cookie is empty', () => {
      const kialiAuth = new KialiAuthentication({
        url: kialiURL,
        strategy: 'token',
        skipTLSVerify: true,
      });
      expect(kialiAuth.shouldRelogin()).toBeTruthy();
    });

    describe('Strategy is not anonymous', () => {
      it('should check the expire time if cookie is set but expire date is out', () => {
        const kialiAuth = new KialiAuthentication({
          url: kialiURL,
          strategy: 'token',
          skipTLSVerify: true,
        });
        const cookieKiali = `${AUTH_KIALI_TOKEN}=kiali-cookie-token`;
        const cookie = `d5b5278d6ecca213a6cda3f6cfaa8cef=d0f2b7c7d1dd95460bc1764814f35468; ${cookieKiali} ; date=today`;
        kialiAuth.setKialiCookie(cookie);
        const session: Session = {
          expiresOn: yesterday.toISOString(),
          username: 'kiali',
        };
        kialiAuth.setSession(session);
        expect(kialiAuth.shouldRelogin()).toBeTruthy();
      });

      it('should check the expire time if cookie is set and expire date is fine', () => {
        const kialiAuth = new KialiAuthentication({
          url: kialiURL,
          strategy: 'token',
          skipTLSVerify: true,
        });
        const cookieKiali = `${AUTH_KIALI_TOKEN}=kiali-cookie-token`;
        const cookie = `d5b5278d6ecca213a6cda3f6cfaa8cef=d0f2b7c7d1dd95460bc1764814f35468; ${cookieKiali} ; date=today`;
        kialiAuth.setKialiCookie(cookie);
        const session: Session = {
          expiresOn: tomorrow.toISOString(),
          username: 'kiali',
        };
        kialiAuth.setSession(session);
        expect(kialiAuth.getSession()).toBe(session);
        expect(kialiAuth.shouldRelogin()).toBeFalsy();
      });

      it('should check if we need extend session', () => {
        const kialiAuth = new KialiAuthentication({
          url: kialiURL,
          strategy: 'token',
          skipTLSVerify: true,
          sessionTime: 60 * 60, // 1 hour of session
        });
        const cookieKiali = `${AUTH_KIALI_TOKEN}=kiali-cookie-token`;
        const cookie = `d5b5278d6ecca213a6cda3f6cfaa8cef=d0f2b7c7d1dd95460bc1764814f35468; ${cookieKiali} ; date=today`;
        kialiAuth.setKialiCookie(cookie);
        let session: Session = {
          expiresOn: tomorrow.toISOString(),
          username: 'kiali',
        };
        kialiAuth.setSession(session);
        expect(kialiAuth.checkIfExtendSession()).toBeFalsy();
        session = { expiresOn: yesterday.toISOString(), username: 'kiali' };
        kialiAuth.setSession(session);
        expect(kialiAuth.checkIfExtendSession()).toBeTruthy();

        // Check with sessionTime less than option
        const today_less_sessiontime = moment().add(50, 'minutes');
        session = {
          expiresOn: today_less_sessiontime.toISOString(),
          username: 'kiali',
        };
        kialiAuth.setSession(session);
        expect(kialiAuth.checkIfExtendSession()).toBeTruthy();

        // Check with sessionTime less than option
        const today_more_sessiontime = moment().add(70, 'minutes');
        session = {
          expiresOn: today_more_sessiontime.toISOString(),
          username: 'kiali',
        };
        kialiAuth.setSession(session);
        expect(kialiAuth.checkIfExtendSession()).toBeFalsy();
      });
    });
  });
});
