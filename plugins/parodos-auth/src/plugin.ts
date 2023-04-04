import { createPlugin } from '@backstage/core-plugin-api';
import { SignInPage } from './components/SignInPage';

export const parodosAuthPlugin = createPlugin({
  id: 'parodos-auth',
});

export const ParodosSignInPage = SignInPage;
