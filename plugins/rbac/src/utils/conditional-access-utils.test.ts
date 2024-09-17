import { PermissionCondition } from '@backstage/plugin-permission-common';

import { criterias } from '../components/ConditionalAccess/const';
import {
  Condition,
  ConditionsData,
} from '../components/ConditionalAccess/types';
import {
  extractNestedConditions,
  ruleOptionDisabled,
} from './conditional-access-utils';

describe('ruleOptionDisabled', () => {
  it('should return false if conditions are not provided', () => {
    expect(ruleOptionDisabled('someRule')).toBe(false);
  });

  it('should return false if the ruleOption is not found in conditions', () => {
    const conditions: PermissionCondition[] = [
      { rule: 'rule1', resourceType: 'catalog-entity', params: {} },
      { rule: 'rule2', resourceType: 'catalog-entity', params: {} },
    ];
    expect(ruleOptionDisabled('someRule', conditions)).toBe(false);
  });

  it('should return true if the ruleOption is found in conditions', () => {
    const conditions: PermissionCondition[] = [
      { rule: 'rule1', resourceType: 'catalog-entity', params: {} },
      { rule: 'someRule', resourceType: 'catalog-entity', params: {} },
    ];
    expect(ruleOptionDisabled('someRule', conditions)).toBe(true);
  });

  it('should handle an empty conditions array', () => {
    const conditions: PermissionCondition[] = [];
    expect(ruleOptionDisabled('someRule', conditions)).toBe(false);
  });

  it('should return false if conditions is undefined', () => {
    expect(ruleOptionDisabled('someRule')).toBe(false);
  });
});

describe('extractNestedConditions', () => {
  const criteriaTypes = [criterias.allOf, criterias.anyOf, criterias.not];
  it('should add conditions matching criteria types to nestedConditions', () => {
    const conditions: Condition[] = [
      { rule: 'rule1', resourceType: 'catalog-entity', params: {} },
      {
        anyOf: [{ rule: 'rule2', resourceType: 'catalog-entity', params: {} }],
      },
    ];
    const nestedConditions: Condition[] = [];
    extractNestedConditions(conditions, criteriaTypes, nestedConditions);

    expect(nestedConditions).toEqual([
      {
        anyOf: [{ rule: 'rule2', resourceType: 'catalog-entity', params: {} }],
      },
    ]);
  });

  it('should not add conditions if nested conditions exist', () => {
    const conditions: Condition[] = [
      { condition: { rule: 'value1', resourceType: 'value2' } },
    ];
    const nestedConditions: Condition[] = [];

    extractNestedConditions(conditions, criteriaTypes, nestedConditions);

    expect(nestedConditions).toEqual([]);
  });

  it('should handle an empty conditions array', () => {
    const conditions: Condition[] = [];
    const nestedConditions: Condition[] = [];

    extractNestedConditions(conditions, criteriaTypes, nestedConditions);

    expect(nestedConditions).toEqual([]);
  });

  it('should not duplicate conditions if only contains simple rules', () => {
    const conditions: Condition[] = [
      { rule: 'rule1', resourceType: 'catalog-entity', params: {} },
      { rule: 'rule2', resourceType: 'catalog-entity', params: {} },
    ];
    const nestedConditions: ConditionsData[] = [];

    extractNestedConditions(conditions, criteriaTypes, nestedConditions);

    expect(nestedConditions).toEqual([]);
  });
});
