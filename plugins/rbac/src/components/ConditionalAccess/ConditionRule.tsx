import React from 'react';

import {
  getDefaultRule,
  ruleOptionDisabled,
} from '../../utils/conditional-access-utils';
import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { criterias } from './const';
import { AccessConditionsErrors, ConditionsData, RulesData } from './types';

type ConditionRuleProps = {
  conditionRow: ConditionsData;
  selPluginResourceType: string;
  onRuleChange: (newCondition: ConditionsData) => void;
  criteria: string;
  conditionRulesData?: RulesData;
  setErrors: React.Dispatch<
    React.SetStateAction<AccessConditionsErrors | undefined>
  >;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ConditionRule = ({
  conditionRow,
  selPluginResourceType,
  onRuleChange,
  criteria,
  conditionRulesData,
  setErrors,
  setRemoveAllClicked,
}: ConditionRuleProps) => {
  return (
    criteria === criterias.condition && (
      <ConditionsFormRowFields
        oldCondition={
          conditionRow.condition ?? getDefaultRule(selPluginResourceType)
        }
        onRuleChange={onRuleChange}
        conditionRow={conditionRow}
        criteria={criteria}
        conditionRulesData={conditionRulesData}
        setErrors={setErrors}
        optionDisabled={ruleOption =>
          ruleOptionDisabled(
            ruleOption,
            conditionRow.condition ? [conditionRow.condition] : undefined,
          )
        }
        setRemoveAllClicked={setRemoveAllClicked}
      />
    )
  );
};
