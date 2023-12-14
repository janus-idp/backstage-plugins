export type SelectedMember = {
  label: string;
  etag: string;
  namespace?: string;
  type: string;
  members?: number;
  description?: string;
  ref: string;
};

export type RowPolicy = { label: string; checked: boolean };

export type PermissionPolicyRow = {
  plugin: string;
  permission: string;
  policies: RowPolicy[];
};

export type RoleFormValues = {
  name: string;
  namespace: string;
  kind: string;
  description?: string;
  selectedMembers: SelectedMember[];
  permissionPoliciesRows: PermissionPolicyRow[];
};

export type PermissionPolicies = { [permission: string]: string[] };

export type PluginsPermissions = {
  [plugin: string]: {
    permissions: string[];
    policies: PermissionPolicies;
  };
};

export type PluginsPermissionPoliciesData = {
  plugins: string[];
  pluginsPermissions: PluginsPermissions;
};
