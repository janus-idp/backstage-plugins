import { Enforcer, FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import { isEqual } from 'lodash';

import { MODEL } from '../service/permission-model';
import {
  validateEntityReference,
  validatePolicy,
} from '../service/policies-validation';
import {
  checkForDuplicateGroupPolicies,
  checkForDuplicatePolicies,
  transformArraytoPolicy,
  updatePolicies,
} from './utils';

export const loadFilteredPoliciesFromCSV = async (
  policyFile: string,
  enf: Enforcer,
  entityRef: string,
  resourceType: string,
  action: string,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(policyFile),
  );

  const roles = await enf.getFilteredGroupingPolicy(0, entityRef);

  const policies: string[][] = [];
  const enforcerPolicies: string[][] = [];

  for (const role of roles) {
    const policyByRole = await fileEnf.getFilteredPolicy(
      0,
      role[1],
      resourceType,
      action,
    );
    policies.push(...policyByRole);
    const enforcerPolicy = await enf.getFilteredPolicy(
      0,
      role[1],
      resourceType,
      action,
    );
    enforcerPolicies.push(...enforcerPolicy);
  }

  if (isEqual(policies, enforcerPolicies)) {
    return;
  }

  if (policies.length === 0) {
    policies.push(
      ...(await fileEnf.getFilteredPolicy(1, resourceType, action)),
    );
  }

  for (const policy of policies) {
    const err = validatePolicy(transformArraytoPolicy(policy));
    if (err) {
      throw new Error(
        `Failed to validate policy from file ${policyFile}. Cause: ${err.message}`,
      );
    }

    await checkForDuplicatePolicies(fileEnf, policy, policyFile);

    // Potential old policy that might need to be removed
    const tempPolicy = [
      policy.at(0)!,
      policy.at(1)!,
      policy.at(2)!,
      policy.at(3) === 'deny' ? 'allow' : 'deny',
    ];

    // Ensure that the fileEnforcer also doesn't have the flip effect as well
    if (await fileEnf.hasPolicy(...tempPolicy)) {
      throw new Error(
        `Duplicate policy ${policy[0]}, ${policy[1]}, ${policy[2]} with different actions found in the file ${policyFile}`,
      );
    }

    await updatePolicies(enf, tempPolicy, policy);
  }

  // Policies that are no longer in the file need to be removed from the enforcer
  for (const policy of enforcerPolicies) {
    if (!(await fileEnf.hasPolicy(...policy))) {
      await enf.removePolicy(...policy);
    }
  }
};

export const loadFilteredGroupingPoliciesFromCSV = async (
  policyFile: string,
  enf: Enforcer,
  entityRef: string,
) => {
  const roleIssues: string[][] = [];
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(policyFile),
  );

  const roles = await fileEnf.getFilteredGroupingPolicy(0, entityRef);

  const enforcerRoles = await enf.getFilteredGroupingPolicy(0, entityRef);

  if (isEqual(roles, enforcerRoles)) {
    return;
  }

  for (const role of roles) {
    await checkForDuplicateGroupPolicies(fileEnf, role, policyFile);

    const err = validateEntityReference(role[1]);
    if (err) {
      throw new Error(
        `Failed to validate group policy from file ${policyFile}. Cause: ${err.message}`,
      );
    }

    // Role exists in the file but not the enforcer
    if (!(await enf.hasGroupingPolicy(...role))) {
      enf.addGroupingPolicy(...role);
    }
  }

  for (const role of enforcerRoles) {
    // This is to catch stray issues with roles that have problems with their users
    roleIssues.push(...(await fileEnf.getFilteredGroupingPolicy(1, role[1])));

    // Role exists in the enforcer but not the file
    // Remove from enforcer
    if (!(await fileEnf.hasGroupingPolicy(...role))) {
      enf.removeGroupingPolicy(...role);
    }
  }

  for (const role of roleIssues) {
    const err = validateEntityReference(role[0]);
    if (err) {
      throw new Error(
        `Failed to validate group policy from file ${policyFile}. Cause: ${err.message}`,
      );
    }
  }
};

export const loadPoliciesFromCSV = async (
  preDefinedPoliciesFile: string,
  enf: Enforcer,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(preDefinedPoliciesFile),
  );
  const policies = await fileEnf.getPolicy();
  for (const policy of policies) {
    const err = validateEntityReference(policy[0]);
    if (err) {
      throw new Error(
        `Failed to validate policy from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
      );
    }

    if (!(await enf.hasPolicy(...policy))) {
      await enf.addPolicy(...policy);
    } else {
      throw new Error(
        `Duplicate policy ${policy} found in the file ${preDefinedPoliciesFile}`,
      );
    }
  }

  const groupPolicies = await fileEnf.getGroupingPolicy();
  for (const groupPolicy of groupPolicies) {
    let err = validateEntityReference(groupPolicy[0]);
    if (err) {
      throw new Error(
        `Failed to validate group policy from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
      );
    }
    err = validateEntityReference(groupPolicy[1]);
    if (err) {
      throw new Error(
        `Failed to validate group policy from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
      );
    }
    if (!(await enf.hasGroupingPolicy(...groupPolicy))) {
      await enf.addGroupingPolicy(...groupPolicy);
    } else {
      throw new Error(
        `Duplicate grouping policy ${groupPolicy} found in the file ${preDefinedPoliciesFile}`,
      );
    }
  }
};
