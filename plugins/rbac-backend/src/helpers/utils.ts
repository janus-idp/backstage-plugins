import { Enforcer } from 'casbin';

import { RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

// Update polices ->
// remove the old policy that is no longer in the enforcer,
// add the new policy
export const updatePolicies = async (
  enf: Enforcer,
  oldPolicy: string[],
  newPolicy: string[],
): Promise<void> => {
  if (await enf.hasPolicy(...oldPolicy)) {
    await enf.removePolicy(...oldPolicy);
  }

  if (!(await enf.hasPolicy(...newPolicy))) {
    await enf.addPolicy(...newPolicy);
  }
};

export const checkForDuplicatePolicies = async (
  fileEnf: Enforcer,
  policy: string[],
  policyFile: string,
): Promise<void> => {
  const duplicates = await fileEnf.getFilteredPolicy(0, ...policy);

  if (duplicates.length > 1) {
    throw new Error(
      `Duplicate policy ${policy} found in the file ${policyFile}`,
    );
  }
};

export const checkForDuplicateGroupPolicies = async (
  fileEnf: Enforcer,
  policy: string[],
  policyFile: string,
): Promise<void> => {
  const duplicates = await fileEnf.getFilteredGroupingPolicy(0, ...policy);

  if (duplicates.length > 1) {
    throw new Error(
      `Duplicate grouping policy ${policy} found in the file ${policyFile}`,
    );
  }
};

export const transformArraytoPolicy = (
  policyArray: string[],
): RoleBasedPolicy => {
  const [entityReference, permission, policy, effect] = policyArray;
  return { entityReference, permission, policy, effect };
};
