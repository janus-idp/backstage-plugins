export const criterias = {
  condition: 'condition',
  anyOf: 'anyOf',
  allOf: 'allOf',
  not: 'not',
};

export const criteriasLabels = {
  [criterias.condition]: 'Condition',
  [criterias.allOf]: 'AllOf',
  [criterias.anyOf]: 'AnyOf',
  [criterias.not]: 'Not',
};

export const conditionButtons = [
  { val: criterias.condition, label: criteriasLabels[criterias.condition] },
  { val: criterias.allOf, label: criteriasLabels[criterias.allOf] },
  { val: criterias.anyOf, label: criteriasLabels[criterias.anyOf] },
  { val: criterias.not, label: criteriasLabels[criterias.not] },
];
