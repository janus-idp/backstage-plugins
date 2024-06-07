import { PermissionsData } from '../../types';

export const initialPermissionPolicyRowValue: PermissionsData = {
  plugin: '',
  permission: '',
  policies: [
    { policy: 'Create', effect: 'deny' },
    { policy: 'Read', effect: 'deny' },
    { policy: 'Update', effect: 'deny' },
    { policy: 'Delete', effect: 'deny' },
  ],
  isResourced: false,
};
