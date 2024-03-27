import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { RoleConditionalPolicyDecision } from '@janus-idp/backstage-plugin-rbac-common';

import { validateRoleCondition } from './condition-validation';

describe('condition-validation', () => {
  describe('validation common fields', () => {
    it('should fail validation role condition without pluginId', () => {
      const condition: any = {
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'pluginId' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without resourceType', () => {
      const condition: any = {
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without role entity reference', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'roleEntityRef' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without result', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'result' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without conditions', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'conditions' must be specified in the role condition`,
      );
    });
  });

  describe('validate simple condition', () => {
    it('should fail validation role-condition.conditions without rule', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.condition`,
      );
    });

    it('should fail validation role-condition.conditions without resourceType', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.condition`,
      );
    });

    it('should validate role-condition.conditions without errors', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('validate "not" criteria', () => {
    it('should fail validation role-condition.conditions.not without rule', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          not: {
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.not.condition`,
      );
    });

    it('should fail validation role-condition.conditions.not without resourceType', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          not: {
            rule: 'IS_ENTITY_OWNER',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.not.condition`,
      );
    });

    it('should validate role-condition.conditions.not without errors', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('validate anyOf criteria', () => {
    it('should fail validation role-condition.conditions.anyOf with an empty array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.anyOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf with non array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: {
            rule: 'IS_ENTITY_OWNER',
            params: {
              claims: ['group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.anyOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without resourceType in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.anyOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without resourceType in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.anyOf[1].condition`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without rule in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.anyOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without rule in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.anyOf[1].condition`,
      );
    });

    it('should validate role-condition.conditions.anyOf without errors', () => {
      const condition: RoleConditionalPolicyDecision = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissions: [{ name: 'catalog.entity-read', action: 'read' }],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('validate allOf criteria', () => {
    it('should fail validation role-condition.conditions.allOf with an empty array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          allOf: [],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.allOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.allOf with non array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          allOf: {
            rule: 'IS_ENTITY_OWNER',
            params: {
              claims: ['group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.allOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without resourceType in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.allOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without resourceType in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.allOf[1].condition`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without rule in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          allOf: [
            {
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.allOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without rule in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.allOf[1].condition`,
      );
    });

    it('should success validation role-condition.conditions.allOf', () => {
      const condition: RoleConditionalPolicyDecision = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissions: [{ name: 'catalog.entity.read', action: 'read' }],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });
});
