import { client } from '../../__fixtures__/helpers';
import { KeycloakProviderConfig } from './config';
import { readKeycloakRealm } from './read';

const config = {
  realm: 'myrealm',
} as unknown as KeycloakProviderConfig;

describe('readKeycloakRealm', () => {
  it('should return the correct number of users and groups', async () => {
    const { users, groups } = await readKeycloakRealm(client, config);

    expect(users).toHaveLength(3);
    expect(groups).toHaveLength(4);
  });
});
