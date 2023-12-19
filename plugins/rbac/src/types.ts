import { GroupEntity, UserEntity } from '@backstage/catalog-model';

import { RowPolicy } from './components/CreateRole/types';

export type RolesData = {
  name: string;
  description: string;
  members: string[];
  permissions: number;
  modifiedBy: string;
  lastModified: string;
  actionsPermissionResults: {
    delete: { allowed: boolean; loading: boolean };
    edit: { allowed: boolean; loading: boolean };
  };
};

export type MembersData = {
  name: string;
  type: 'User' | 'Group';
  members: number;
  ref: {
    name: string;
    namespace: string;
    kind: string;
  };
};

export type PermissionsDataSet = {
  plugin: string;
  permission: string;
  policies: Set<RowPolicy>;
  policyString?: Set<string>;
};

export type PermissionsData = {
  plugin: string;
  permission: string;
  policies: RowPolicy[];
  policyString?: string[];
};

export type MemberEntity = UserEntity | GroupEntity;

export type RoleError = { error: { name: string; message: string } };
