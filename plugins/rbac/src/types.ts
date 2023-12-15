import { GroupEntity, UserEntity } from '@backstage/catalog-model';

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

export type PermissionsData = {
  plugin: string;
  permission: string;
  policies: Set<{ policy: string; effect: string }>;
  policyString: Set<string>;
};

export type MemberEntity = UserEntity | GroupEntity;

export type CreateRoleError = { error: { name: string; message: string } };
