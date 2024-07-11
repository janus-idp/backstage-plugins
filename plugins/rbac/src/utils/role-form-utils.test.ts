import { IdentityApi } from '@backstage/core-plugin-api';
import { MockConfigApi } from '@backstage/test-utils';

import { RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

import { mockNewConditions } from '../__fixtures__/mockConditions';
import {
  mockAssociatedPolicies,
  mockPolicies,
} from '../__fixtures__/mockPolicies';
import { RBACAPI, RBACBackendClient } from '../api/RBACBackendClient';
import { RoleBasedConditions, UpdatedConditionsData } from '../types';
import {
  createConditions,
  createPermissions,
  modifyConditions,
  removeConditions,
  removePermissions,
} from './role-form-utils';

jest.mock('../api/RBACBackendClient');

describe('RBAC Permissions Functions', () => {
  let mockRbacApi: RBACAPI;

  const bearerToken = 'test-token';

  const identityApi = {
    async getCredentials() {
      return { token: bearerToken };
    },
  } as IdentityApi;

  const mockConfigApi = new MockConfigApi({
    permission: {
      enabled: true,
    },
  });

  beforeEach(() => {
    mockRbacApi = new RBACBackendClient({
      configApi: mockConfigApi,
      identityApi,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPermissions', () => {
    it('should call createPolicies with the correct parameters', async () => {
      const newPermissions: RoleBasedPolicy[] = mockAssociatedPolicies;
      mockRbacApi.createPolicies = jest
        .fn()
        .mockResolvedValue({ status: 200 } as Response);

      await createPermissions(newPermissions, mockRbacApi);
      expect(mockRbacApi.createPolicies).toHaveBeenCalledWith(newPermissions);
    });

    it('should throw an error if createPolicies returns an error', async () => {
      const newPermissions: RoleBasedPolicy[] = mockAssociatedPolicies;
      const errorMsg = 'Mock error message';
      mockRbacApi.createPolicies = jest
        .fn()
        .mockResolvedValue({ error: { message: errorMsg, name: 'Not found' } });

      await expect(
        createPermissions(newPermissions, mockRbacApi),
      ).rejects.toThrow(
        `Unable to create the permission policies. ${errorMsg}`,
      );
    });
  });

  describe('removePermissions', () => {
    it('should call deletePolicies with the correct parameters', async () => {
      const name = 'role:default/rbac_admin';
      const deletePermissions: RoleBasedPolicy[] = mockPolicies;
      mockRbacApi.deletePolicies = jest
        .fn()
        .mockResolvedValue({ status: 204 } as Response);

      await removePermissions(name, deletePermissions, mockRbacApi);
      expect(mockRbacApi.deletePolicies).toHaveBeenCalledWith(
        name,
        deletePermissions,
      );
    });

    it('should throw an error if deletePolicies returns an error', async () => {
      const name = 'role:default/rbac_admin';
      const deletePermissions: RoleBasedPolicy[] = mockPolicies;
      const errorMsg = 'Mock error message';
      mockRbacApi.deletePolicies = jest
        .fn()
        .mockResolvedValue({ error: { message: errorMsg, name: 'Not found' } });

      await expect(
        removePermissions(name, deletePermissions, mockRbacApi),
      ).rejects.toThrow(
        `Unable to delete the permission policies. ${errorMsg}`,
      );
    });
  });

  describe('removeConditions', () => {
    it('should call deleteConditionalPolicies for each condition', async () => {
      const deleteConditions = [1, 2, 3];
      mockRbacApi.deleteConditionalPolicies = jest
        .fn()
        .mockResolvedValue({ status: 204 } as Response);

      await removeConditions(deleteConditions, mockRbacApi);
      deleteConditions.forEach(cid => {
        expect(mockRbacApi.deleteConditionalPolicies).toHaveBeenCalledWith(cid);
      });
    });

    it('should throw an error if any deleteConditionalPolicies call returns an error', async () => {
      const deleteConditions = [1, 2, 3];
      const errorMsg = 'Mock error message';
      mockRbacApi.deleteConditionalPolicies = jest
        .fn()
        .mockResolvedValueOnce({ status: 204 } as Response)
        .mockResolvedValueOnce({ status: 204 } as Response)
        .mockResolvedValueOnce({
          error: { message: errorMsg, name: 'Not found' },
        });

      await expect(
        removeConditions(deleteConditions, mockRbacApi),
      ).rejects.toThrow(
        `Unable to remove conditions from the role. ${errorMsg}`,
      );
    });
  });

  describe('modifyConditions', () => {
    it('should call updateConditionalPolicies for each condition', async () => {
      const updateConditions: UpdatedConditionsData = [
        {
          id: 1,
          updateCondition: mockNewConditions[0],
        },
      ];
      mockRbacApi.updateConditionalPolicies = jest
        .fn()
        .mockResolvedValue({ status: 200 } as Response);

      await modifyConditions(updateConditions, mockRbacApi);
      updateConditions.forEach(({ id, updateCondition }) => {
        expect(mockRbacApi.updateConditionalPolicies).toHaveBeenCalledWith(
          id,
          updateCondition,
        );
      });
    });

    it('should throw an error if any updateConditionalPolicies call returns an error', async () => {
      const updateConditions: UpdatedConditionsData = [
        {
          id: 2,
          updateCondition: mockNewConditions[1],
        },
      ];
      const errorMsg = 'Mock error message';
      mockRbacApi.updateConditionalPolicies = jest.fn().mockResolvedValue({
        error: { message: errorMsg, name: 'Not found' },
      });

      await expect(
        modifyConditions(updateConditions, mockRbacApi),
      ).rejects.toThrow(`Unable to update conditions. ${errorMsg}`);
    });
  });

  describe('createConditions', () => {
    it('should call createConditionalPermission for each condition', async () => {
      const newConditions: RoleBasedConditions[] = mockNewConditions;
      mockRbacApi.createConditionalPermission = jest
        .fn()
        .mockResolvedValue({ status: 200 } as Response);

      await createConditions(newConditions, mockRbacApi);
      newConditions.forEach(cpp => {
        expect(mockRbacApi.createConditionalPermission).toHaveBeenCalledWith(
          cpp,
        );
      });
    });

    it('should throw an error if any createConditionalPermission call returns an error', async () => {
      const newConditions: RoleBasedConditions[] = mockNewConditions;
      const errorMsg = 'Mock error message';
      mockRbacApi.createConditionalPermission = jest.fn().mockResolvedValue({
        error: { message: errorMsg, name: 'Not found' },
      });

      await expect(
        createConditions(newConditions, mockRbacApi),
      ).rejects.toThrow(`Unable to add conditions to the role. ${errorMsg}`);
    });
  });
});
