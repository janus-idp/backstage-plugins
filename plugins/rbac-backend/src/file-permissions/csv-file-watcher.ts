import { Enforcer, FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import chokidar from 'chokidar';
import { parse } from 'csv-parse/sync';
import { difference } from 'lodash';
import { Logger } from 'winston';

import fs from 'fs';

import { RoleMetadataStorage } from '../database/role-metadata';
import {
  metadataStringToPolicy,
  policyToString,
  transformArrayToPolicy,
} from '../helper';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import {
  checkForDuplicateGroupPolicies,
  checkForDuplicatePolicies,
  validateGroupingPolicy,
  validatePolicy,
} from '../service/policies-validation';

export const CSV_PERMISSION_POLICY_FILE_AUTHOR = 'csv permission policy file';

type CSVFilePolicies = {
  addedPolicies: string[][];
  addedGroupPolicies: string[][];
  removedPolicies: string[][];
  removedGroupPolicies: string[][];
};

export class CSVFileWatcher {
  private currentContent: string[][];
  private csvFilePolicies: CSVFilePolicies;
  private csvFileName: string;
  constructor(
    private readonly enforcer: EnforcerDelegate,
    private readonly logger: Logger,
    private readonly roleMetadataStorage: RoleMetadataStorage,
  ) {
    this.csvFileName = '';
    this.currentContent = [];
    this.csvFilePolicies = {
      addedPolicies: [],
      addedGroupPolicies: [],
      removedPolicies: [],
      removedGroupPolicies: [],
    };
  }

  /**
   * getCurrentContents reads the current contents of the CSV file.
   * @returns The current contents of the CSV file.
   */
  getCurrentContents(): string {
    return fs.readFileSync(this.csvFileName, 'utf-8');
  }

  /**
   * parse is used to parse the current contents of the CSV file.
   * @returns The CSV file parsed into a string[][].
   */
  parse(): string[][] {
    const content = this.getCurrentContents();
    const parser = parse(content, {
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    });

    return parser;
  }

  /**
   * watchFile initializes the file watcher and sets it to begin watching for changes.
   */
  watchFile(): void {
    const watcher = chokidar.watch(this.csvFileName);
    watcher.on('change', async path => {
      this.logger.info(`file ${path} has changed`);
      await this.onChange();
    });
  }

  /**
   * initialize will initialize the CSV file by loading all of the permission policies and roles into
   * the enforcer.
   * First, we will remove all roles and permission policies if they do not exist in the temporary file enforcer.
   * Next, we will add all roles and permission polices if they are new to the CSV file
   * Finally, we will set the file to be watched if allow reload is set
   * @param csvFileName The name of the csvFile
   * @param allowReload Whether or not we will allow reloads of the CSV file
   */
  async initialize(
    csvFileName: string | undefined,
    allowReload: boolean,
  ): Promise<void> {
    let content: string[][] = [];
    // If the file is set load the file contents
    if (csvFileName) {
      this.csvFileName = csvFileName;
      content = this.parse();
    }

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new FileAdapter(this.csvFileName),
    );

    // Check for any old policies that will need to be removed by checking if
    // the policy no longer exists in the temp enforcer (csv file)
    const policiesToRemove =
      await this.enforcer.getFilteredPolicyMetadata('csv-file');

    for (const policy of policiesToRemove) {
      const convertedPolicy = metadataStringToPolicy(policy.policy);
      if (
        convertedPolicy.length === 2 &&
        !(await tempEnforcer.hasGroupingPolicy(...convertedPolicy))
      ) {
        this.csvFilePolicies.removedGroupPolicies.push(convertedPolicy);
      } else if (
        convertedPolicy.length > 2 &&
        !(await tempEnforcer.hasPolicy(...convertedPolicy))
      ) {
        this.csvFilePolicies.removedPolicies.push(convertedPolicy);
      }
    }

    // Check for any new policies that need to be added by checking if
    // the policy does not currently exist in the enforcer
    const policiesToAdd = await tempEnforcer.getPolicy();
    const groupPoliciesToAdd = await tempEnforcer.getGroupingPolicy();

    for (const policy of policiesToAdd) {
      if (!(await this.enforcer.hasPolicy(...policy))) {
        this.csvFilePolicies.addedPolicies.push(policy);
      }
    }

    for (const groupPolicy of groupPoliciesToAdd) {
      if (!(await this.enforcer.hasGroupingPolicy(...groupPolicy))) {
        this.csvFilePolicies.addedGroupPolicies.push(groupPolicy);
      }
    }

    // Check for policies that might need to be updated
    // This will involve removing legacy policies if they exist in both the
    // temp enforcer (csv file) and the enforcer
    // We will then add them back with the new source
    const policiesToUpdate =
      await this.enforcer.getFilteredPolicyMetadata('legacy');

    for (const policy of policiesToUpdate) {
      const convertedPolicy = metadataStringToPolicy(policy.policy);
      if (
        convertedPolicy.length === 2 &&
        (await tempEnforcer.hasGroupingPolicy(...convertedPolicy)) &&
        (await this.enforcer.hasGroupingPolicy(...convertedPolicy))
      ) {
        this.csvFilePolicies.addedGroupPolicies.push(convertedPolicy);
      } else if (
        convertedPolicy.length > 2 &&
        (await tempEnforcer.hasPolicy(...convertedPolicy)) &&
        (await this.enforcer.hasPolicy(...convertedPolicy))
      ) {
        this.csvFilePolicies.addedPolicies.push(convertedPolicy);
      }
    }

    // We pass current here because this is during initialization and it has not changed yet
    await this.updatePolicies(content, tempEnforcer);

    if (allowReload && csvFileName) {
      this.watchFile();
    }
  }

  /**
   * onChange is called whenever there is a change to the CSV file.
   * It will parse the current and new contents of the CSV file and process the roles and permission policies present.
   * Afterwards, it will find the difference between the current and new contents of the CSV file
   * and sort them into added / removed, permission policies / roles.
   * It will finally call updatePolicies with the new content.
   */
  async onChange(): Promise<void> {
    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new FileAdapter(this.csvFileName),
    );

    const newContent = this.parse();
    const currentFlatContent = this.currentContent.flatMap(data => {
      return policyToString(data);
    });
    const newFlatContent = newContent.flatMap(data => {
      return policyToString(data);
    });

    const diffRemoved = difference(currentFlatContent, newFlatContent); // policy was removed
    const diffAdded = difference(newFlatContent, currentFlatContent); // policy was added

    if (diffRemoved.length === 0 && diffAdded.length === 0) {
      return;
    }

    diffRemoved.forEach(policy => {
      const convertedPolicy = metadataStringToPolicy(policy);
      if (convertedPolicy[0] === 'p') {
        convertedPolicy.splice(0, 1);
        this.csvFilePolicies.removedPolicies.push(convertedPolicy);
      } else if (convertedPolicy[0] === 'g') {
        convertedPolicy.splice(0, 1);
        this.csvFilePolicies.removedGroupPolicies.push(convertedPolicy);
      }
    });

    diffAdded.forEach(policy => {
      const convertedPolicy = metadataStringToPolicy(policy);
      if (convertedPolicy[0] === 'p') {
        convertedPolicy.splice(0, 1);
        this.csvFilePolicies.addedPolicies.push(convertedPolicy);
      } else if (convertedPolicy[0] === 'g') {
        convertedPolicy.splice(0, 1);
        this.csvFilePolicies.addedGroupPolicies.push(convertedPolicy);
      }
    });

    await this.updatePolicies(newContent, tempEnforcer);
  }

  /**
   * updatePolicies is used to update all of the permission policies and roles within a CSV file.
   * It will check the number of added and removed permissions policies and roles and call the appropriate
   * methods for these.
   * It will also update the current contents of the CSV file to the most recent
   * @param newContent The new content present in the CSV file
   * @param tempEnforcer Temporary enforcer for checking for duplicates when adding policies
   */
  async updatePolicies(
    newContent: string[][],
    tempEnforcer: Enforcer,
  ): Promise<void> {
    this.currentContent = newContent;

    if (this.csvFilePolicies.addedPolicies.length > 0)
      await this.addPermissionPolicies(tempEnforcer);
    if (this.csvFilePolicies.removedPolicies.length > 0)
      await this.removePermissionPolicies();
    if (this.csvFilePolicies.addedGroupPolicies.length > 0)
      await this.addRoles(tempEnforcer);
    if (this.csvFilePolicies.removedGroupPolicies.length > 0)
      await this.removeRoles();
  }

  /**
   * addPermissionPolicies will add the new permission policies that are present in the CSV file.
   * We will attempt to validate the permission policy and log any warnings that are encountered.
   * If a warning is encountered, we will skip adding the permission policy to the enforcer.
   * @param tempEnforcer Temporary enforcer for checking for duplicates when adding policies
   */
  async addPermissionPolicies(tempEnforcer: Enforcer): Promise<void> {
    for (const policy of this.csvFilePolicies.addedPolicies) {
      let err = validatePolicy(transformArrayToPolicy(policy));
      if (err) {
        this.logger.warn(
          `Failed to validate policy from file ${this.csvFileName}. Cause: ${err.message}`,
        );
        continue;
      }

      err = await checkForDuplicatePolicies(
        tempEnforcer,
        policy,
        this.csvFileName,
      );
      if (err) {
        this.logger.warn(err.message);
        continue;
      }
      try {
        await this.enforcer.addOrUpdatePolicy(
          policy,
          'csv-file',
          CSV_PERMISSION_POLICY_FILE_AUTHOR,
          true,
        );
      } catch (e) {
        this.logger.warn(
          `Failed to add or update policy ${policy} after modification ${this.csvFileName}. Cause: ${e}`,
        );
      }
    }

    this.csvFilePolicies.addedPolicies = [];
  }

  /**
   * removePermissionPolicies will remove the permission policies that are no longer present in the CSV file.
   */
  async removePermissionPolicies(): Promise<void> {
    try {
      await this.enforcer.removePolicies(
        this.csvFilePolicies.removedPolicies,
        'csv-file',
        CSV_PERMISSION_POLICY_FILE_AUTHOR,
        false,
        true,
      );
    } catch (e) {
      this.logger.warn(
        `Failed to remove policies ${JSON.stringify(
          this.csvFilePolicies.removedPolicies,
        )} after modification ${this.csvFileName}. Cause: ${e}`,
      );
    }
    this.csvFilePolicies.removedPolicies = [];
  }

  /**
   * addRoles will add the new roles that are present in the CSV file.
   * We will attempt to validate the role and log any warnings that are encountered.
   * If a warning is encountered, we will skip adding the role to the enforcer.
   * @param tempEnforcer Temporary enforcer for checking for duplicates when adding policies
   */
  async addRoles(tempEnforcer: Enforcer): Promise<void> {
    for (const groupPolicy of this.csvFilePolicies.addedGroupPolicies) {
      let err = await validateGroupingPolicy(
        groupPolicy,
        this.csvFileName,
        this.roleMetadataStorage,
        'csv-file',
      );
      if (err) {
        this.logger.warn(err.message);
        continue;
      }

      err = await checkForDuplicateGroupPolicies(
        tempEnforcer,
        groupPolicy,
        this.csvFileName,
      );
      if (err) {
        this.logger.warn(err.message);
        continue;
      }

      try {
        await this.enforcer.addOrUpdateGroupingPolicy(
          groupPolicy,
          {
            source: 'csv-file',
            roleEntityRef: groupPolicy[1],
            author: CSV_PERMISSION_POLICY_FILE_AUTHOR,
            modifiedBy: CSV_PERMISSION_POLICY_FILE_AUTHOR,
          },
          true,
        );
      } catch (e) {
        this.logger.warn(
          `Failed to add or update group policy ${groupPolicy} after modification ${this.csvFileName}. Cause: ${e}`,
        );
      }
    }
    this.csvFilePolicies.addedGroupPolicies = [];
  }

  /**
   * removeRoles will remove the roles that are no longer present in the CSV file.
   * If the role exists with multiple groups and or users, we will update it role information.
   * Otherwise, we will remove the role completely.
   */
  async removeRoles(): Promise<void> {
    for (const groupPolicy of this.csvFilePolicies.removedGroupPolicies) {
      // this requires knowledge of whether or not it is an update
      const isUpdate = await this.enforcer.getFilteredGroupingPolicy(
        1,
        groupPolicy[1],
      );

      // Need to update the time
      try {
        await this.enforcer.removeGroupingPolicy(
          groupPolicy,
          {
            source: 'csv-file',
            roleEntityRef: groupPolicy[1],
            author: CSV_PERMISSION_POLICY_FILE_AUTHOR,
            modifiedBy: CSV_PERMISSION_POLICY_FILE_AUTHOR,
          },
          isUpdate.length > 1,
          true,
        );
      } catch (e) {
        this.logger.warn(
          `Failed to remove group policy ${groupPolicy} after modification ${this.csvFileName}. Cause: ${e}`,
        );
      }
    }
    this.csvFilePolicies.removedGroupPolicies = [];
  }
}
