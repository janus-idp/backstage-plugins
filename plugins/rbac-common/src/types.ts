export type Location = 'rest' | 'csv-file' | 'pre-defined';

export type PermissionPolicyMetadata = {
  location: Location;
};

export type RoleMetadata = {
  location: Location;
};

export type Policy = {
  permission?: string;
  policy?: string;
  effect?: string;
  metadata?: PermissionPolicyMetadata;
};

export type RoleBasedPolicy = Policy & {
  entityReference?: string;
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

export type PermissionPolicy = {
  pluginId?: string;
  policies?: Policy[];
};
