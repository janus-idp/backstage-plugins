import { ConditionRulesData } from '../components/ConditionalAccess/types';
import { mockConditionRules } from './mockConditionRules';

export const mockTransformedConditionRules: ConditionRulesData = {
  catalog: {
    'catalog-entity': {
      HAS_ANNOTATION: {
        description: mockConditionRules[0].rules[0].description,
        schema: mockConditionRules[0].rules[0].paramsSchema,
      },
      HAS_LABEL: {
        description: mockConditionRules[0].rules[1].description,
        schema: mockConditionRules[0].rules[1].paramsSchema,
      },
      rules: [
        mockConditionRules[0].rules[0].name,
        mockConditionRules[0].rules[1].name,
      ],
    },
  },
  scaffolder: {
    'scaffolder-template': {
      HAS_TAG: {
        description: mockConditionRules[1].rules[0].description,
        schema: mockConditionRules[1].rules[0].paramsSchema,
      },
      rules: [mockConditionRules[1].rules[0].name],
    },
  },
};
