import { RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

import { RoleMetadataStorage } from '../database/role-metadata';
import {
  validateEntityReference,
  validateGroupingPolicy,
  validatePolicy,
  validateRole,
} from './policies-validation';

const roleMetadataStorageMock: RoleMetadataStorage = {
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

describe('rest data validation', () => {
  describe('validate entity referenced policy', () => {
    it('should return an error when entity reference is empty', () => {
      const policy: RoleBasedPolicy = {};
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'entityReference' must not be empty`);
    });

    it('should return an error when permission is empty', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'permission' field must not be empty`);
    });

    it('should return an error when policy is empty', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'policy' field must not be empty`);
    });

    it('should return an error when effect is empty', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'effect' field must not be empty`);
    });

    it('should return an error when effect has an invalid value', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'invalid-effect',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `'effect' has invalid value: 'invalid-effect'. It should be: 'allow' or 'deny'`,
      );
    });

    it(`pass validation when all fields are valid. Effect 'allow' should be valid`, () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      };
      const err = validatePolicy(policy);
      expect(err).toBeUndefined();
    });

    it(`pass validation when all fields are valid. Effect 'deny' should be valid`, () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'deny',
      };
      const err = validatePolicy(policy);
      expect(err).toBeUndefined();
    });
  });

  describe('validate entity reference', () => {
    it('should return an error when entity reference is an empty', () => {
      const err = validateEntityReference('');
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'entityReference' must not be empty`);
    });

    it('should return an error when entity reference is not full or invalid', () => {
      const invalidOrUnsupportedEntityRefs = [
        {
          ref: 'admin',
          expectedError: `Entity reference "admin" had missing or empty kind (e.g. did not start with "component:" or similar)`,
        },
        {
          ref: 'admin:default',
          expectedError: `entity reference 'admin:default' does not match the required format [<kind>:][<namespace>/]<name>. Provide, please, full entity reference.`,
        },
        {
          ref: 'admin/guest',
          expectedError: `Entity reference "admin/guest" had missing or empty kind (e.g. did not start with "component:" or similar)`,
        },
        {
          ref: 'admin/guest/somewhere',
          expectedError: `Entity reference "admin/guest/somewhere" had missing or empty kind (e.g. did not start with "component:" or similar)`,
        },
        {
          ref: ':default/admin',
          expectedError: `Entity reference ":default/admin" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:/admin',
          expectedError: `Entity reference "user:/admin" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:default/',
          expectedError: `Entity reference "user:default/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:/',
          expectedError: `Entity reference "user:/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':default/',
          expectedError: `Entity reference ":default/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':/guest',
          expectedError: `Entity reference ":/guest" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':/',
          expectedError: `Entity reference ":/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: '/admin',
          expectedError: `Entity reference "/admin" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user/',
          expectedError: `Entity reference "user/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':default',
          expectedError: `Entity reference ":default" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:',
          expectedError: `Entity reference "user:" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'admin:default/test',
          expectedError: `Unsupported kind admin. List supported values ["user", "group", "role"]`,
        },
      ];
      for (const entityRef of invalidOrUnsupportedEntityRefs) {
        const err = validateEntityReference(entityRef.ref);
        expect(err).toBeTruthy();
        expect(err?.message).toEqual(entityRef.expectedError);
      }
    });

    it('should pass entity reference validation', () => {
      const invalidOrUnsupportedEntityRefs = [
        'user:default/guest',
        'user:default/John Doe',
        'user:default/John Doe/developer',
        'role:default/team-a',
      ];
      for (const entityRef of invalidOrUnsupportedEntityRefs) {
        const err = validateEntityReference(entityRef);
        expect(err).toBeFalsy();
      }
    });
  });

  describe('validateRole', () => {
    it('should return an error when "memberReferences" query param is missing', () => {
      const request = { name: 'role:default/user' } as any;
      const err = validateRole(request);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `'memberReferences' field must not be empty`,
      );
    });

    it('should pass validation when all required query params are present', () => {
      const request = {
        memberReferences: ['user:default/guest'],
        name: 'role:default/user',
      } as any;
      const err = validateRole(request);
      expect(err).toBeUndefined();
    });
  });

  describe('validateGroupingPolicy', () => {
    it('should fail validation if the group policy length is greater than two', async () => {
      const groupPolicy = ['user:default/test', 'role:default/test', 'invalid'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        './test',
        roleMetadataStorageMock,
        'csv-file',
      );
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`Group policy should have length 2`);
    });

    it('should fail validation if the member of the group policy starts with role:', async () => {
      const groupPolicy = ['role:default/test', 'role:default/test'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        './test',
        roleMetadataStorageMock,
        'csv-file',
      );
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. rbac-backend plugin doesn't support role inheritance.`,
      );
    });

    it('should fail validation if the group policy contains two groups for group inheritance', async () => {
      const groupPolicy = ['group:default/test', 'group:default/test'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        './test',
        roleMetadataStorageMock,
        'csv-file',
      );
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. Group inheritance information could be provided only with help of Catalog API.`,
      );
    });

    it('should fail validation if the group policy is a user to a group for inheritance', async () => {
      const groupPolicy = ['user:default/test', 'group:default/test'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        './test',
        roleMetadataStorageMock,
        'csv-file',
      );
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. User membership information could be provided only with help of Catalog API.`,
      );
    });
  });
});
