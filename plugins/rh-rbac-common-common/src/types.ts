export type PolicyMetadata = {
  entityReference: string | undefined;
  permission: string | undefined;
  policy: string | undefined;
  effect: string | undefined;
};

export type UpdatePolicyMetadata = {
  oldPolicy: PolicyMetadata;
  newPolicy: PolicyMetadata;
};
