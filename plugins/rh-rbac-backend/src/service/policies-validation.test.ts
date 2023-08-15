import { EntityReferencedPolicy } from '@janus-idp/plugin-rh-rbac-common';

import {
  validateEntityReference,
  validatePolicy,
  validatePolicyQueries,
} from './policies-validation';

describe('rest data validation', () => {
  describe('validate entity referenced policy', () => {
    it('should return an error when entity reference is empty', () => {
      const policy: EntityReferencedPolicy = {};
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'entityReference' must not be empty`);
    });

    it('should return an error when permission is empty', () => {
      const policy: EntityReferencedPolicy = {
        entityReference: 'user:default/guest',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'permission' field must not be empty`);
    });

    it('should return an error when policy is empty', () => {
      const policy: EntityReferencedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'policy' field must not be empty`);
    });

    it('should return an error when effect is empty', () => {
      const policy: EntityReferencedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'effect' field must not be empty`);
    });

    it('should return an error when effect has an invalid value', () => {
      const policy: EntityReferencedPolicy = {
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
      const policy: EntityReferencedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      };
      const err = validatePolicy(policy);
      expect(err).toBeUndefined();
    });

    it(`pass validation when all fields are valid. Effect 'deny' should be valid`, () => {
      const policy: EntityReferencedPolicy = {
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
        'admin',
        'admin:default',
        'admin/guest',
        'admin/guest/somewhere',
      ];
      for (const entityRef of invalidOrUnsupportedEntityRefs) {
        const err = validateEntityReference(entityRef);
        expect(err).toBeTruthy();
        expect(err?.message).toEqual(
          `entity reference '${entityRef}' does not match the required format [<kind>:][<namespace>/]<name>.`,
        );
      }
    });

    it('should pass entity reference validation', () => {
      const invalidOrUnsupportedEntityRefs = [
        'user:default/guest',
        'user:default/John Doe',
        'user:default/John Doe/developer',
      ];
      for (const entityRef of invalidOrUnsupportedEntityRefs) {
        const err = validateEntityReference(entityRef);
        expect(err).toBeFalsy();
      }
    });
  });

  describe('validatePolicyQueries', () => {
    it('should return an error when "permission" query param is missing', () => {
      const request = { query: { policy: 'read', effect: 'allow' } } as any;
      const err = validatePolicyQueries(request);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual('specify "permission" query param.');
    });

    it('should return an error when "policy" query param is missing', () => {
      const request = {
        query: { permission: 'user:default/guest', effect: 'allow' },
      } as any;
      const err = validatePolicyQueries(request);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual('specify "policy" query param.');
    });

    it('should return an error when "effect" query param is missing', () => {
      const request = {
        query: { permission: 'user:default/guest', policy: 'read' },
      } as any;
      const err = validatePolicyQueries(request);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual('specify "effect" query param.');
    });

    it('should pass validation when all required query params are present', () => {
      const request = {
        query: {
          permission: 'user:default/guest',
          policy: 'read',
          effect: 'allow',
        },
      } as any;
      const err = validatePolicyQueries(request);
      expect(err).toBeUndefined();
    });
  });
});
