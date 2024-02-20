import { RoleMetadataDao } from './database/role-metadata';
import {
  deepSortedEqual,
  metadataStringToPolicy,
  policiesToString,
  policyToString,
  removeTheDifference,
  transformArrayToPolicy,
} from './helper';
// Import the function to test
import { EnforcerDelegate } from './service/enforcer-delegate';

describe('helper.ts', () => {
  describe('policyToString', () => {
    it('should convert permission policy to string', () => {
      const policy = [
        'user:default/some-user',
        'catalog-entity',
        'read',
        'allow',
      ];
      const expectedString =
        '[user:default/some-user, catalog-entity, read, allow]';
      expect(policyToString(policy)).toEqual(expectedString);
    });
  });
  describe('policiesToString', () => {
    it('should convert one permission policy to string', () => {
      const policies = [
        ['user:default/some-user', 'catalog-entity', 'read', 'allow'],
      ];
      const expectedString =
        '[[user:default/some-user, catalog-entity, read, allow]]';
      expect(policiesToString(policies)).toEqual(expectedString);
    });

    it('should convert empty permission policy array to string', () => {
      const policies = [[]];
      const expectedString = '[[]]';
      expect(policiesToString(policies)).toEqual(expectedString);
    });
  });

  describe('metadataStringToPolicy', () => {
    it('parses a permission policy string', () => {
      const policy = '[user:default/some-user, catalog-entity, read, allow]';
      const expectedPolicy = [
        'user:default/some-user',
        'catalog-entity',
        'read',
        'allow',
      ];
      expect(metadataStringToPolicy(policy)).toEqual(expectedPolicy);
    });

    it('parses a grouping policy', () => {
      const policy = '[user:default/some-user, role:default/dev]';
      const expectedPolicy = ['user:default/some-user', 'role:default/dev'];
      expect(metadataStringToPolicy(policy)).toEqual(expectedPolicy);
    });
  });

  describe('removeTheDifference', () => {
    const mockEnforcerDelegate: Partial<EnforcerDelegate> = {
      removeGroupingPolicy: jest.fn().mockImplementation(),
    };

    beforeEach(() => {
      (mockEnforcerDelegate.removeGroupingPolicy as jest.Mock).mockClear();
    });

    it('removes the difference between originalGroup and addedGroup', async () => {
      const originalGroup = [
        'user:default/some-user',
        'user:default/dev',
        'user:default/admin',
      ];
      const addedGroup = ['user:default/some-user', 'user:default/dev'];
      const source = 'rest';
      const roleName = 'role:default/admin';

      await removeTheDifference(
        originalGroup,
        addedGroup,
        source,
        roleName,
        mockEnforcerDelegate as EnforcerDelegate,
      );

      expect(mockEnforcerDelegate.removeGroupingPolicy).toHaveBeenCalledWith(
        ['user:default/admin', roleName],
        source,
        true,
      );
    });

    it('does nothing when originalGroup and addedGroup are the same', async () => {
      const originalGroup = ['user:default/some-user', 'user:default/dev'];
      const addedGroup = ['user:default/some-user', 'user:default/dev'];
      const source = 'rest';
      const roleName = 'role:default/admin';

      await removeTheDifference(
        originalGroup,
        addedGroup,
        source,
        roleName,
        mockEnforcerDelegate as EnforcerDelegate,
      );

      expect(mockEnforcerDelegate.removeGroupingPolicy).not.toHaveBeenCalled();
    });

    it('does nothing when originalGroup is empty', async () => {
      const originalGroup: string[] = [];
      const addedGroup = ['user:default/some-user', 'role:default/dev'];
      const source = 'rest';
      const roleName = 'admin';

      await removeTheDifference(
        originalGroup,
        addedGroup,
        source,
        roleName,
        mockEnforcerDelegate as EnforcerDelegate,
      );

      expect(mockEnforcerDelegate.removeGroupingPolicy).not.toHaveBeenCalled();
    });
  });

  describe('transformArrayToPolicy', () => {
    it('transforms array to RoleBasedPolicy object', () => {
      const policyArray = [
        'role:default/dev',
        'catalog-entity',
        'read',
        'allow',
      ];
      const expectedPolicy = {
        entityReference: 'role:default/dev',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      };

      const result = transformArrayToPolicy(policyArray);

      expect(result).toEqual(expectedPolicy);
    });
  });

  describe('deepSortedEqual', () => {
    it('should return true for identical objects with nested properties in different order', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa team',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      const obj2: RoleMetadataDao = {
        roleEntityRef: 'role:default/qa',
        description: 'qa team',
        id: 1,
        source: 'rest',
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(true);
    });

    it('should return true for identical objects with different ordering of top-level properties', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa team',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      const obj2: RoleMetadataDao = {
        id: 1,
        description: 'qa team',
        source: 'rest',
        roleEntityRef: 'role:default/qa',
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for objects with different values', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      const obj2: RoleMetadataDao = {
        description: 'great qa',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different source', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      const obj2: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'configuration',
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different id', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      const obj2: RoleMetadataDao = {
        description: 'qa teams',
        id: 2,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different role entity reference', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
      };
      const obj2: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/dev',
        source: 'rest',
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });
  });
});
