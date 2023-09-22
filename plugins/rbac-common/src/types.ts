export type Policy = {
  permission?: string;
  policy?: string;
  effect?: string;
};

export type EntityReferencedPolicy = Policy & {
  entityReference?: string;
};

export type UpdatePolicy = {
  oldPolicy: Policy;
  newPolicy: Policy;
};
