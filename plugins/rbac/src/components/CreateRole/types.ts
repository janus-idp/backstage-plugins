import { PermissionsData } from '../../types';

export type SelectedMember = {
  id?: string;
  label: string;
  etag: string;
  namespace?: string;
  type: string;
  members?: number;
  description?: string;
  ref: string;
};

export type RowPolicy = {
  policy: string;
  effect: string;
};

export type RoleFormValues = {
  name: string;
  namespace: string;
  kind: string;
  description?: string;
  selectedMembers: SelectedMember[];
  permissionPoliciesRows: PermissionsData[];
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
