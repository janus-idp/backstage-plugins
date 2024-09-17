import {
  SignInPage as BackstageSignInPage,
  IdentityProviders,
} from '@backstage/core-components';
import {
  configApiRef,
  githubAuthApiRef,
  SignInPageProps,
  useApi,
} from '@backstage/core-plugin-api';

export const SignInPage = (props: SignInPageProps) => {
  const configApi = useApi(configApiRef);

  const providerConfigExists = (providerId: string): boolean => {
    return !!configApi.getOptionalConfig(`auth.providers.${providerId}`);
  };
  const providers: IdentityProviders = [];

  if (providerConfigExists('guest')) {
    providers.push('guest');
  }
  if (providerConfigExists('github')) {
    providers.push({
      id: 'github-auth-provider',
      title: 'GitHub',
      message: 'Sign in using GitHub',
      apiRef: githubAuthApiRef,
    });
  }

  return <BackstageSignInPage {...props} providers={providers} />;
};
