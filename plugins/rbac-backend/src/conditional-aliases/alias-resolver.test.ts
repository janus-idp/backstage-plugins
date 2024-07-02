import {
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';

import { replaceAliases } from './alias-resolver';

describe('replaceAliases', () => {
  it('should replace aliases without criteria', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {
        claims: ['$currentUser'],
      },
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {
        claims: ['user:default/tim', 'group:default/team-a'],
      },
    });
  });

  it('should replace aliases with criteria not', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      not: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['$currentUser'],
        },
      },
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      not: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['user:default/tim', 'group:default/team-a'],
        },
      },
    });
  });

  it('should replace aliases with criteria anyOf', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
      ],
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim', 'group:default/team-a'],
          },
        },
      ],
    });
  });

  it('should replace aliases with criteria anyOf and few values', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim', 'group:default/team-a'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    });
  });

  it('should replace aliases with criteria allOf', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
      ],
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim', 'group:default/team-a'],
          },
        },
      ],
    });
  });

  it('should replace aliases with criteria allOf and few values', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim', 'group:default/team-a'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    });
  });

  it('should replace aliases with nested criteria', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      allOf: [
        {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$currentUser'],
            },
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    };

    replaceAliases(conditionParam, [
      'user:default/tim',
      'group:default/team-a',
    ]);

    expect(conditionParam).toEqual({
      allOf: [
        {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    });
  });
});
