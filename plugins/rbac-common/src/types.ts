import { NotAllowedError } from '@backstage/errors';
import {
  ConditionalPolicyDecision,
  PermissionAttributes,
} from '@backstage/plugin-permission-common';

export type Source =
  | 'rest' // created via REST API
  | 'csv-file' // created via policies-csv-file with defined path in the application configuration
  | 'configuration' // created from application configuration
  | 'legacy'; // preexisting policies

export type PermissionPolicyMetadata = {
  source: Source;
};

export type RoleMetadata = {
  description?: string;
  source?: Source;
  modifiedBy?: string;
  author?: string;
  lastModified?: string;
  createdAt?: string;
};

export type Policy = {
  permission?: string;
  policy?: string;
};

export type RoleBasedPolicy = Policy & {
  entityReference?: string;
  effect?: string;
  metadata?: PermissionPolicyMetadata;
};

export type Role = {
  memberReferences: string[];
  name: string;
  metadata?: RoleMetadata;
};

export type UpdatePolicy = {
  oldPolicy: Policy;
  newPolicy: Policy;
};

export type NamedPolicy = {
  name: string;

  policy: string;
};

export type ResourcedPolicy = NamedPolicy & {
  resourceType: string;
};

export type PolicyDetails = NamedPolicy | ResourcedPolicy;

export function isResourcedPolicy(
  policy: PolicyDetails,
): policy is ResourcedPolicy {
  return 'resourceType' in policy;
}

export type PluginPermissionMetaData = {
  pluginId: string;
  policies: PolicyDetails[];
};

export type NonEmptyArray<T> = [T, ...T[]];

// Permission framework attributes action has values: 'create' | 'read' | 'update' | 'delete' | undefined.
// But we are introducing an action named "use" when action does not exist('undefined') to avoid
// a more complicated model with multiple policy and request shapes.
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'use';
export const toPermissionAction = (
  attr: PermissionAttributes,
): PermissionAction => attr.action ?? 'use';

export type PermissionInfo = {
  name: string;
  action: PermissionAction;
};

// Frontend should use RoleConditionalPolicyDecision<PermissionAction>
export type RoleConditionalPolicyDecision<
  T extends PermissionAction | PermissionInfo,
> = ConditionalPolicyDecision & {
  id: number;
  roleEntityRef: string;

  permissionMapping: T[];
};

// UnauthorizedError should be uniformely used for authorization errors.
export class UnauthorizedError extends NotAllowedError {
  constructor() {
    super('Unauthorized');
  }
}
