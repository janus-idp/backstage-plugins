export type Source =
  | 'rest' // created via REST API
  | 'csv-file' // created via policies-csv-file with defined path in the application configuration
  | 'configuration'; // created from application configuration

export type RoleSource = Source | 'default'; // hard coded in the plugin code

export type PermissionPolicyMetadata = {
  source: Source;
};

export type RoleMetadata = {
  source: RoleSource;
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
