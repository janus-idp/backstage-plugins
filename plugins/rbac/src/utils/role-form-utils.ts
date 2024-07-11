import { RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

import { RBACAPI } from '../api/RBACBackendClient';
import {
  RoleBasedConditions,
  RoleError,
  UpdatedConditionsData,
} from '../types';

export const createPermissions = async (
  newPermissions: RoleBasedPolicy[],
  rbacApi: RBACAPI,
  errorMsgPrefix?: string,
) => {
  if (newPermissions.length > 0) {
    const permissionsRes = await rbacApi.createPolicies(newPermissions);
    if ((permissionsRes as unknown as RoleError).error) {
      throw new Error(
        `${errorMsgPrefix || 'Unable to create the permission policies.'} ${
          (permissionsRes as unknown as RoleError).error.message
        }`,
      );
    }
  }
};

export const removePermissions = async (
  name: string,
  deletePermissions: RoleBasedPolicy[],
  rbacApi: RBACAPI,
) => {
  if (deletePermissions.length > 0) {
    const permissionsRes = await rbacApi.deletePolicies(
      name,
      deletePermissions,
    );
    if ((permissionsRes as unknown as RoleError).error) {
      throw new Error(
        `Unable to delete the permission policies. ${
          (permissionsRes as unknown as RoleError).error.message
        }`,
      );
    }
  }
};

export const removeConditions = async (
  deleteConditions: number[],
  rbacApi: RBACAPI,
) => {
  if (deleteConditions.length > 0) {
    const promises = deleteConditions.map(cid =>
      rbacApi.deleteConditionalPolicies(cid),
    );

    const cppRes: (Response | RoleError)[] = await Promise.all(promises);
    const cpErr = cppRes
      .map(r => (r as unknown as RoleError).error?.message)
      .filter(m => m);

    if (cpErr.length > 0) {
      throw new Error(
        `Unable to remove conditions from the role. ${cpErr.join('\n')}`,
      );
    }
  }
};

export const modifyConditions = async (
  updateConditions: UpdatedConditionsData,
  rbacApi: RBACAPI,
) => {
  if (updateConditions.length > 0) {
    const promises = updateConditions.map(({ id, updateCondition }) =>
      rbacApi.updateConditionalPolicies(id, updateCondition),
    );

    const cppRes: (Response | RoleError)[] = await Promise.all(promises);
    const cpErr = cppRes
      .map(r => (r as unknown as RoleError).error?.message)
      .filter(m => m);

    if (cpErr.length > 0) {
      throw new Error(`Unable to update conditions. ${cpErr.join('\n')}`);
    }
  }
};

export const createConditions = async (
  newConditions: RoleBasedConditions[],
  rbacApi: RBACAPI,
  errorMsgPrefix?: string,
) => {
  if (newConditions.length > 0) {
    const promises = newConditions.map(cpp =>
      rbacApi.createConditionalPermission(cpp),
    );

    const cppRes: (Response | RoleError)[] = await Promise.all(promises);
    const cpErr = cppRes
      .map(r => (r as unknown as RoleError).error?.message)
      .filter(m => m);

    if (cpErr.length > 0) {
      throw new Error(
        `${errorMsgPrefix || 'Unable to add conditions to the role.'} ${cpErr.join('\n')}`,
      );
    }
  }
};
