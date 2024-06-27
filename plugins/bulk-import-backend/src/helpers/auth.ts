import { AuthService } from '@backstage/backend-plugin-api';

export async function getTokenForPlugin(
  auth: AuthService,
  targetPluginId: string,
): Promise<string> {
  const resp = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId,
  });
  return resp.token;
}
