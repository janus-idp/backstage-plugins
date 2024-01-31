export type Policy = {
  permission?: string;
  policy?: string;
  effect?: string;
};

export type RoleBasedPolicy = Policy & {
  entityReference?: string;
};

export type Role = {
  memberReferences: string[];
  name: string;
};

export type UpdatePolicy = {
  oldPolicy: Policy;
  newPolicy: Policy;
};

export type PermissionPolicy = {
  pluginId?: string;
  policies?: Policy[];
};
