import React from 'react';
import {
  BackstageUserIdentity,
  IdentityApi,
  SignInPageProps,
} from '@backstage/core-plugin-api';
import { ParodosSignInPage } from '@janus-idp/backstage-plugin-parodos-auth';

/*
  For the development and testing purposes, we have a separate authentication flow for different plugins.

  For production environment, this is expected not to be used.
*/
const ConditionalSignInPage = ({ onSignInSuccess }: SignInPageProps) => {
  const isParodos = window.location.pathname.startsWith('/parodos');

  React.useEffect(() => {
    if (!isParodos) {
      // for the rest of backstage where we do not need authentication:
      const fakeIdentity: IdentityApi = {
        getBackstageIdentity: (): Promise<BackstageUserIdentity> =>
          Promise.resolve({
            type: 'user',
            userEntityRef: `user:default/default`,
            ownershipEntityRefs: [`user:default/default`],
          }),
        getProfileInfo: () => Promise.resolve({}),
        getCredentials: () =>
          Promise.resolve({
            /* token is undefined */
          }),
        signOut: () => Promise.resolve(),
      };
      onSignInSuccess(fakeIdentity);
    }
  }, [isParodos, onSignInSuccess]);

  if (isParodos) {
    return <ParodosSignInPage onSignInSuccess={onSignInSuccess} />;
  }

  // non-parodos: chain other providers here
  return null;
};

export default ConditionalSignInPage;
