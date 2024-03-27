import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { ConditionRules } from '../components/ConditionalAccess/types';

export const useConditionRules = (): ConditionRules => {
  const rbacApi = useApi(rbacApiRef);

  const {
    value: conditionRules,
    loading: conditionRulesLoading,
    error: conditionRulesErr,
  } = useAsync(async () => {
    return await rbacApi.getPluginsConditionRules();
  });

  const conditionRulesData =
    !conditionRulesLoading && Array.isArray(conditionRules)
      ? conditionRules.reduce((acc, pluginRules) => {
          return { ...acc, [`${pluginRules.pluginId}`]: pluginRules.rules };
        }, {})
      : undefined;

  return { data: conditionRulesData, error: conditionRulesErr };
};
