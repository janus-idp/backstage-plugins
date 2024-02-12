import { Enforcer, FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import { isEqual } from 'lodash';
import { Logger } from 'winston';

import { PolicyMetadataStorage } from '../database/policy-metadata-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { metadataStringToPolicy, transformArraytoPolicy } from '../helper';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import {
  checkForDuplicateGroupPolicies,
  checkForDuplicatePolicies,
  validateAllPredefinedPolicies,
  validateEntityReference,
  validatePolicy,
} from '../service/policies-validation';

const addPolicy = async (
  policy: string[],
  enf: EnforcerDelegate,
  policyMetadataStorage: PolicyMetadataStorage,
  logger: Logger,
): Promise<void> => {
  const source = await policyMetadataStorage?.findPolicyMetadata(policy);

  if (!(await enf.hasPolicy(...policy))) {
    await enf.addPolicy(policy, 'csv-file');
  } else if (source?.source !== 'csv-file') {
    logger.warn(
      `Duplicate policy: ${policy[0]}, ${policy[1]}, ${policy[2]} found with the source ${source?.source}`,
    );
  }
};

const removeEnforcerPolicies = async (
  enforcerPolicies: string[][],
  tempEnf: Enforcer,
  enf: EnforcerDelegate,
  policyMetadataStorage: PolicyMetadataStorage,
): Promise<void> => {
  for (const policy of enforcerPolicies) {
    const enfPolicySource =
      await policyMetadataStorage?.findPolicyMetadata(policy);
    if (
      !(await tempEnf.hasPolicy(...policy)) &&
      enfPolicySource?.source === 'csv-file'
    ) {
      await enf.removePolicy(policy, 'csv-file', true);
    }
  }
};

const catchRoleIssues = (
  roleIssues: string[][],
  policyFile: string,
  logger: Logger,
): void => {
  for (const role of roleIssues) {
    const err = validateEntityReference(role[0]);
    if (err) {
      logger.warn(
        `Failed to validate role from file ${policyFile}. Cause: ${err.message}`,
      );
    }
  }
};

export const loadFilteredPoliciesFromCSV = async (
  policyFile: string,
  enf: EnforcerDelegate,
  policyFilter: string[],
  logger: Logger,
  policyMetadataStorage: PolicyMetadataStorage,
  fileEnf?: Enforcer,
) => {
  const tempEnforcer =
    fileEnf ??
    (await newEnforcer(newModelFromString(MODEL), new FileAdapter(policyFile)));

  const roles = await enf.getFilteredGroupingPolicy(0, policyFilter[0]);

  const policies: string[][] = [];
  let enforcerPolicies: string[][] = [];

  for (const role of roles) {
    const policyByRole = await tempEnforcer.getFilteredPolicy(
      0,
      role[1],
      policyFilter[1],
      policyFilter[2],
    );
    policies.push(...policyByRole);
    const enforcerPolicy = await enf.getFilteredPolicy(
      0,
      role[1],
      policyFilter[1],
      policyFilter[2],
    );
    enforcerPolicies.push(...enforcerPolicy);
  }

  if (isEqual(policies, enforcerPolicies)) {
    return;
  }

  if (policies.length === 0) {
    policies.push(
      ...(await tempEnforcer.getFilteredPolicy(
        1,
        policyFilter[1],
        policyFilter[2],
      )),
    );
  }

  await removeEnforcerPolicies(
    enforcerPolicies,
    tempEnforcer,
    enf,
    policyMetadataStorage,
  );

  for (const policy of policies) {
    const err = validatePolicy(transformArraytoPolicy(policy));
    if (err) {
      logger.warn(
        `Failed to validate policy from file ${policyFile}. Cause: ${err.message}`,
      );
      continue;
    }

    const duplicateError = await checkForDuplicatePolicies(
      tempEnforcer,
      policy,
      policyFile,
    );
    if (duplicateError) {
      logger.warn(duplicateError.message);
    }

    const effectFlipPolicy = [
      policy[0],
      policy[1],
      policy[2],
      policy[3] === 'deny' ? 'allow' : 'deny',
    ];

    const flipSource =
      await policyMetadataStorage?.findPolicyMetadata(effectFlipPolicy);
    const isDupFlipPolicy = await enf.hasPolicy(...effectFlipPolicy);
    const isFileFlipPolicy = await tempEnforcer.hasPolicy(...effectFlipPolicy);
    const isCSVSource = flipSource?.source === 'csv-file';

    if (
      (isDupFlipPolicy && !isCSVSource) ||
      (isFileFlipPolicy && isCSVSource)
    ) {
      logger.warn(
        `Duplicate policy: ${policy[0]}, ${policy[1]}, ${policy[2]} with different actions found with the source ${flipSource?.source}`,
      );
      continue;
    }

    if (isDupFlipPolicy && isCSVSource) {
      await enf.removePolicy(effectFlipPolicy, 'csv-file', true);

      enforcerPolicies = enforcerPolicies.filter(
        policyCheck => !isEqual(policyCheck, effectFlipPolicy),
      );
    }

    await addPolicy(policy, enf, policyMetadataStorage, logger);
  }
};

export const loadFilteredGroupingPoliciesFromCSV = async (
  policyFile: string,
  enf: EnforcerDelegate,
  entityRef: string,
  logger: Logger,
  policyMetadataStorage: PolicyMetadataStorage,
  fileEnf?: Enforcer,
) => {
  const tempEnforcer =
    fileEnf ??
    (await newEnforcer(newModelFromString(MODEL), new FileAdapter(policyFile)));
  const roleIssues: string[][] = [];

  const roles = await tempEnforcer.getFilteredGroupingPolicy(0, entityRef);
  const enforcerRoles = await enf.getFilteredGroupingPolicy(0, entityRef);

  if (isEqual(roles, enforcerRoles)) {
    return;
  }

  for (const role of roles) {
    const duplicateError = await checkForDuplicateGroupPolicies(
      tempEnforcer,
      role,
      policyFile,
    );

    if (duplicateError) {
      logger.warn(duplicateError.message);
    }

    const err = validateEntityReference(role[1]);
    if (err) {
      logger.warn(
        `Failed to validate role from file ${policyFile}. Cause: ${err.message}`,
      );
      continue;
    }

    const roleSource = await policyMetadataStorage?.findPolicyMetadata(role);

    // Role exists in the file but not the enforcer
    if (!(await enf.hasGroupingPolicy(...role))) {
      await enf.addOrUpdateGroupingPolicy(role, 'csv-file');
    } else if (roleSource?.source !== 'csv-file') {
      logger.warn(
        `Duplicate role: ${role[0]}, ${role[1]} found with the source ${roleSource?.source}`,
      );
      continue;
    }
  }

  for (const role of enforcerRoles) {
    // This is to catch stray issues with roles that have problems with their users
    roleIssues.push(
      ...(await tempEnforcer.getFilteredGroupingPolicy(1, role[1])),
    );

    // Role exists in the enforcer but not the file
    const enfRoleSource = await policyMetadataStorage?.findPolicyMetadata(role);

    if (
      !(await tempEnforcer.hasGroupingPolicy(...role)) &&
      enfRoleSource?.source === 'csv-file'
    ) {
      await enf.removeGroupingPolicy(role, 'csv-file', true, true);
    }
  }

  // Role Issues was meant to catch things with messed up users,
  catchRoleIssues(roleIssues, policyFile, logger);
};

export const loadFilteredCSV = async (
  policyFile: string,
  enf: EnforcerDelegate,
  policyFilter: string[],
  logger: Logger,
  policyMetadataStorage: PolicyMetadataStorage,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(policyFile),
  );

  await loadFilteredPoliciesFromCSV(
    policyFile,
    enf,
    policyFilter,
    logger,
    policyMetadataStorage,
    fileEnf,
  );
  await loadFilteredGroupingPoliciesFromCSV(
    policyFile,
    enf,
    policyFilter[0],
    logger,
    policyMetadataStorage,
    fileEnf,
  );
};

export const removedOldPermissionPoliciesFileData = async (
  enf: EnforcerDelegate,
  fileEnf?: Enforcer,
) => {
  const tempEnforcer =
    fileEnf ?? (await newEnforcer(newModelFromString(MODEL)));
  const oldFilePolicies = new Set<string[]>();
  const policiesMetadata = await enf.getFilteredPolicyMetadata('csv-file');
  for (const policyMetadata of policiesMetadata) {
    oldFilePolicies.add(metadataStringToPolicy(policyMetadata.policy));
  }

  const policiesToDelete: string[][] = [];
  const groupPoliciesToDelete: string[][] = [];
  for (const oldFilePolicy of oldFilePolicies) {
    if (
      oldFilePolicy.length === 2 &&
      !(await tempEnforcer.hasGroupingPolicy(...oldFilePolicy))
    ) {
      groupPoliciesToDelete.push(oldFilePolicy);
    } else if (
      oldFilePolicy.length > 2 &&
      !(await tempEnforcer.hasPolicy(...oldFilePolicy))
    ) {
      policiesToDelete.push(oldFilePolicy);
    }
  }

  if (groupPoliciesToDelete.length > 0) {
    await enf.removeGroupingPolicies(groupPoliciesToDelete, 'csv-file', true);
  }
  if (policiesToDelete.length > 0) {
    await enf.removePolicies(policiesToDelete, 'csv-file', true);
  }
};

export const addPermissionPoliciesFileData = async (
  preDefinedPoliciesFile: string,
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  logger: Logger,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(preDefinedPoliciesFile),
  );
  const policies = await fileEnf.getPolicy();
  const groupPolicies = await fileEnf.getGroupingPolicy();

  const validationError = await validateAllPredefinedPolicies(
    policies,
    groupPolicies,
    preDefinedPoliciesFile,
    roleMetadataStorage,
    enf,
  );
  if (validationError) {
    logger.warn(validationError.message);
  }

  await removedOldPermissionPoliciesFileData(enf, fileEnf);

  for (const policy of policies) {
    const duplicateError = await checkForDuplicatePolicies(
      fileEnf,
      policy,
      preDefinedPoliciesFile,
    );
    if (duplicateError) {
      logger.warn(duplicateError.message);
    }
    await enf.addOrUpdatePolicy(policy, 'csv-file', true);
  }

  for (const groupPolicy of groupPolicies) {
    const duplicateError = await checkForDuplicateGroupPolicies(
      fileEnf,
      groupPolicy,
      preDefinedPoliciesFile,
    );

    if (duplicateError) {
      logger.warn(duplicateError.message);
    }
    await enf.addOrUpdateGroupingPolicy(groupPolicy, 'csv-file', false);
  }
};
