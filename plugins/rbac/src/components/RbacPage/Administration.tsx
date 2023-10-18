/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import { useAsync } from 'react-use';

import { SidebarItem } from '@backstage/core-components';
import {
  IconComponent,
  identityApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';

import SupervisorAccount from '@material-ui/icons/SupervisorAccount';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { rootRouteRef } from '../../routes';

/** @public */
export const Administration = (props: { icon?: IconComponent }) => {
  const identityApi = useApi(identityApiRef);
  const rbacApi = useApi(rbacApiRef);
  const { value, loading } = useAsync(async () => {
    return {
      identity: await identityApi.getBackstageIdentity(),
    };
  }, []);
  const { loading: isUserLoading, value: isUserAuthorized } =
    useAsync(async () => {
      if (!loading && value?.identity.userEntityRef) {
        return await rbacApi.getUserAuthorization(value.identity.userEntityRef);
      }
      return undefined;
    }, [loading]);

  if (!isUserLoading) {
    console.log(
      '!!!!!userrr ',
      value?.identity.userEntityRef,
      '  ',
      isUserAuthorized,
    );
  }
  const routePath = useRouteRef(rootRouteRef);
  const Icon = props.icon ? props.icon : SupervisorAccount;
  return <SidebarItem text="Administration" to={routePath()} icon={Icon} />;
};
