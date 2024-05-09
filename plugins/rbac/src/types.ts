import { GroupEntity, UserEntity } from '@backstage/catalog-model';

import { RJSFSchema } from '@rjsf/utils';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import { ConditionsData } from './components/ConditionalAccess/types';
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
  isResourced?: boolean;
  conditions?: ConditionsData;
};

export type MemberEntity = UserEntity | GroupEntity;

export type RoleError = { error: { name: string; message: string } };

export type RoleBasedConditions = Omit<
  RoleConditionalPolicyDecision<PermissionAction>,
  'id'
>;

export type ConditionRule = {
  name: string;
  description?: string;
  resourceType: string;
  paramsSchema: RJSFSchema;
};

export type PluginConditionRules = {
  pluginId: string;
  rules: ConditionRule[];
};
