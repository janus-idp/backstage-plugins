export type RolesData = {
  name: string;
  description: string;
  members: string[];
  permissions: number;
  modifiedBy: string;
  lastModified: string;
  permissionResult: { allowed: boolean; loading: boolean };
};
