import { LoggerService } from '@backstage/backend-plugin-api';

import { newEnforcer, newModelFromString, StringAdapter } from 'casbin';

import {
  RBACProvider,
  RBACProviderConnection,
} from '@janus-idp/backstage-plugin-rbac-node';

import { RoleMetadataStorage } from '../database/role-metadata';
import {
  groupPoliciesToString,
  permissionPoliciesToString,
  transformArrayToPolicy,
} from '../helper';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import {
  validateGroupingPolicy,
  validatePolicy,
  validateSource,
} from '../validation/policies-validation';

class Connection implements RBACProviderConnection {
  constructor(
    private readonly id: string,
    private readonly enforcer: EnforcerDelegate,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly logger: LoggerService,
  ) {}

  async applyRoles(roles: string[][]): Promise<void> {
    const providerRoles: string[][] = [];

    const stringPolicy = groupPoliciesToString(roles);

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new StringAdapter(stringPolicy),
    );

    const currentRoles = await this.roleMetadataStorage.filterRoleMetadata(
      this.id,
    );
    const providerRoleMetadata = currentRoles.map(meta => meta.roleEntityRef);

    // Get the roles for this provider coming from rbac plugin
    for (const providerRole of providerRoleMetadata) {
      providerRoles.push(
        ...(await this.enforcer.getFilteredGroupingPolicy(1, providerRole)),
      );
    }

    // Remove role
    // role exists in rbac but does not exist in provider
    for (const role of providerRoles) {
      if (!(await tempEnforcer.hasGroupingPolicy(...role))) {
        const roleMeta = await this.roleMetadataStorage.findRoleMetadata(
          role[1],
        );

        const currentRole = await this.enforcer.getFilteredGroupingPolicy(
          1,
          role[1],
        );

        if (!roleMeta) {
          throw new Error('role does not exist');
        }

        // Only one role exists in rbac remove role metadata as well
        if (roleMeta && currentRole.length === 1) {
          await this.enforcer.removeGroupingPolicy(role, roleMeta);
          continue; // Move on to the next role
        }

        await this.enforcer.removeGroupingPolicy(role, roleMeta, true);
      }
    }

    // Add the role
    // role exists in provider but does not exist in rbac
    for (const role of roles) {
      if (!(await this.enforcer.hasGroupingPolicy(...role))) {
        const err = await validateGroupingPolicy(
          role,
          this.roleMetadataStorage,
          this.id,
        );

        if (err) {
          this.logger.warn(err.message);
          continue; // Skip adding this role as there was an error
        }

        const roleMeta = await this.roleMetadataStorage.findRoleMetadata(
          role[1],
        );

        // role does not exist in rbac, create the metadata for it
        if (!roleMeta) {
          const roleMetadata = {
            modifiedBy: this.id,
            source: this.id,
            roleEntityRef: role[1],
          };
          await this.enforcer.addGroupingPolicy(role, roleMetadata); // <- TODO more knex trax issues
          continue; // Move on to the next role
        }

        await this.enforcer.addGroupingPolicy(role, roleMeta);
      }
    }
  }

  async applyPermissions(permissions: string[][]): Promise<void> {
    const stringPolicy = permissionPoliciesToString(permissions);

    const providerPermissions: string[][] = [];

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new StringAdapter(stringPolicy),
    );

    const currentRoles = await this.roleMetadataStorage.filterRoleMetadata(
      this.id,
    );
    const providerRoleMetadata = currentRoles.map(meta => meta.roleEntityRef);

    // Get the roles for this provider coming from rbac plugin
    for (const providerRole of providerRoleMetadata) {
      providerPermissions.push(
        ...(await this.enforcer.getFilteredPolicy(0, providerRole)),
      );
    }

    for (const permission of providerPermissions) {
      if (!(await tempEnforcer.hasPolicy(...permission))) {
        this.enforcer.removePolicy(permission);
      }
    }

    for (const permission of permissions) {
      if (!(await this.enforcer.hasPolicy(...permission))) {
        const transformedPolicy = transformArrayToPolicy(permission);
        const metadata = await this.roleMetadataStorage.findRoleMetadata(
          permission[0],
        );

        let err = validatePolicy(transformedPolicy);
        if (err) {
          this.logger.warn(`Invalid permission policy, ${err}`);
          continue; // Skip this invalid permission policy
        }

        err = await validateSource(this.id, metadata);
        if (err) {
          this.logger.warn(
            `Unable to add policy ${permission}. Cause: ${err.message}`,
          );
          continue;
        }

        await this.enforcer.addPolicy(permission);
      }
    }
  }

  async refresh(): Promise<void> {
    console.log('refresh for manually refreshing');
  }
}

export async function connectRBACProviders(
  providers: RBACProvider[],
  enforcer: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  logger: LoggerService,
) {
  await Promise.all(
    providers.map(async provider => {
      const connection = new Connection(
        provider.getProviderName(),
        enforcer,
        roleMetadataStorage,
        logger,
      );
      return provider.connect(connection);
    }),
  );
}
