import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import {
  ConditionRules,
  ConditionRulesData,
  ResourceTypeRuleData,
  RulesData,
} from '../components/ConditionalAccess/types';
import { ConditionRule, PluginConditionRules } from '../types';
import { uniqBy } from '../utils/create-role-utils';

const getPluginsResourceTypes = (
  conditionRules: PluginConditionRules[],
): { [plugin: string]: string[] } => {
  return conditionRules.reduce((acc, pluginRules) => {
    return {
      ...acc,
      [`${pluginRules.pluginId}`]: uniqBy(
        pluginRules.rules.map(rule => rule.resourceType),
        val => val,
      ),
    };
  }, {});
};

const getRuleData = (pluginRules: PluginConditionRules, resType: string) => {
  return pluginRules.rules.reduce(
    (ruleAcc: RulesData, rule: ConditionRule) => {
      return rule.resourceType === resType
        ? {
            ...ruleAcc,
            [`${rule.name}`]: {
              schema: rule.paramsSchema,
              description: rule.description,
            },
            rules: [...ruleAcc.rules, rule.name],
          }
        : ruleAcc;
    },
    { rules: [] },
  );
};

const getConditionRulesData = (conditionRules: PluginConditionRules[]) => {
  const pluginsResourceTypes = getPluginsResourceTypes(conditionRules);

  return conditionRules.reduce((acc: ConditionRulesData, pluginRules) => {
    return {
      ...acc,
      [`${pluginRules.pluginId}`]: pluginsResourceTypes[
        pluginRules.pluginId
      ].reduce((resAcc: ResourceTypeRuleData, resType: string) => {
        return {
          ...resAcc,
          [`${resType}`]: getRuleData(pluginRules, resType),
        };
      }, {}),
    };
  }, {});
};

export const useConditionRules = (): ConditionRules => {
  const rbacApi = useApi(rbacApiRef);

  const {
    value: conditionRules,
    loading: conditionRulesLoading,
    error: conditionRulesErr,
  } = useAsync(async () => {
    return await rbacApi.getPluginsConditionRules();
  });

  const isConditionRulesAvailable =
    !conditionRulesLoading && Array.isArray(conditionRules);

  const conditionRulesData = isConditionRulesAvailable
    ? getConditionRulesData(conditionRules)
    : undefined;

  return {
    data: conditionRulesData,
    error: conditionRulesErr,
  };
};
