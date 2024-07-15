/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AuthService,
  BackstageCredentials,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

/**
 * This will resolve to { result: AuthorizeResult.ALLOW } if the permission framework is disabled
 */
export async function permissionCheck(
  permissions: PermissionsService,
  credentials: BackstageCredentials,
) {
  const decision = (
    await permissions.authorize(
      [
        {
          permission: bulkImportPermission,
          resourceRef: bulkImportPermission.resourceType,
        },
      ],
      {
        credentials,
      },
    )
  )[0];

  if (decision.result === AuthorizeResult.DENY) {
    throw new NotAllowedError('Unauthorized');
  }
}

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
