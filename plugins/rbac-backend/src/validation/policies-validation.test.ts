import Knex from 'knex';

import {
  RoleBasedPolicy,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import {
  validateEntityReference,
  validateGroupingPolicy,
  validatePolicy,
  validateRole,
  validateSource,
} from './policies-validation';

const modifiedBy = 'user:default/some-admin';

const roleMetadataStorageMock: RoleMetadataStorage = {
  findRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadataDao> => {
        return {
          roleEntityRef: 'role:default/catalog-reader',
          source: 'rest',
          modifiedBy,
        };
      },
    ),
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

  describe('validateSource', () => {
    const roleMeta: RoleMetadataDao = {
      roleEntityRef: 'role:default/catalog-reader',
      source: 'rest',
      modifiedBy,
    };

    it('should not return an error whenever the source that is passed matches the source of the role', async () => {
      const source: Source = 'rest';

      const err = await validateSource(source, roleMeta);

      expect(err).toBeUndefined();
    });

    it('should not return an error whenever the source that is passed does not match a legacy source role', async () => {
      const roleMetaLegacy: RoleMetadataDao = {
        roleEntityRef: 'role:default/legacy-reader',
        source: 'legacy',
        modifiedBy,
      };

      const source: Source = 'rest';

      const err = await validateSource(source, roleMetaLegacy);

      expect(err).toBeUndefined();
    });

    it('should return an error whenever the source that is passed does not match the source of the role', async () => {
      const source: Source = 'csv-file';

      const err = await validateSource(source, roleMeta);

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      );
    });
  });

  describe('validateGroupingPolicy', () => {
    let groupPolicy = ['user:default/test', 'role:default/catalog-reader'];
    let source: Source = 'rest';
    const roleMeta: RoleMetadataDao = {
      roleEntityRef: 'role:default/catalog-reader',
      source: 'rest',
      modifiedBy,
    };

    it('should not return an error during validation', async () => {
      const err = await validateGroupingPolicy(
        groupPolicy,
        roleMetadataStorageMock,
        source,
      );

      expect(err).toBeUndefined();
    });

    it('should return an error if the grouping policy is too long', async () => {
      groupPolicy = [
        'user:default/test',
        'role:default/catalog-reader',
        'extra',
      ];

      const err = await validateGroupingPolicy(
        groupPolicy,
        roleMetadataStorageMock,
        source,
      );

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`Group policy should have length 2`);
    });

    it('should return an error if a member starts with role:', async () => {
      groupPolicy = ['role:default/test', 'role:default/catalog-reader'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        roleMetadataStorageMock,
        source,
      );

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. rbac-backend plugin doesn't support role inheritance.`,
      );
    });

    it('should return an error for group inheritance (user to group)', async () => {
      groupPolicy = ['user:default/test', 'group:default/catalog-reader'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        roleMetadataStorageMock,
        source,
      );

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. User membership information could be provided only with help of Catalog API.`,
      );
    });

    it('should return an error for group inheritance (group to group)', async () => {
      groupPolicy = ['group:default/test', 'group:default/catalog-reader'];

      const err = await validateGroupingPolicy(
        groupPolicy,
        roleMetadataStorageMock,
        source,
      );

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. Group inheritance information could be provided only with help of Catalog API.`,
      );
    });

    it('should return an error for mismatch source', async () => {
      groupPolicy = ['user:default/test', 'role:default/catalog-reader'];
      source = 'csv-file';

      const err = await validateGroupingPolicy(
        groupPolicy,
        roleMetadataStorageMock,
        source,
      );

      expect(err).toBeTruthy();
      expect(err?.name).toEqual('NotAllowedError');
      expect(err?.message).toEqual(
        `Unable to validate role ${groupPolicy}. Cause: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      );
    });
  });
});
