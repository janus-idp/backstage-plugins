import { createExtensionPoint } from '@backstage/backend-plugin-api';

import { GroupTransformer, UserTransformer } from './lib/types';

/**
 * An extension point that exposes the ability to implement user and group transformer functions for keycloak.
 *
 * @public
 */
export const keycloakTransformerExtensionPoint =
  createExtensionPoint<KeycloakTransformerExtensionPoint>({
    id: 'keycloak.transformer',
  });

/**
 * The interface for {@link keycloakTransformerExtensionPoint}.
 *
 * @public
 */
export type KeycloakTransformerExtensionPoint = {
  setUserTransformer(userTransformer: UserTransformer): void;
  setGroupTransformer(groupTransformer: GroupTransformer): void;
};
