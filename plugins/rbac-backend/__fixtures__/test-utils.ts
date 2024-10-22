import type { LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { Config } from '@backstage/config';

import {
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
} from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import { CasbinDBAdapterFactory } from '../src/database/casbin-adapter-factory';
import { RoleMetadataStorage } from '../src/database/role-metadata';
import { RBACPermissionPolicy } from '../src/policies/permission-policy';
import { BackstageRoleManager } from '../src/role-manager/role-manager';
import { EnforcerDelegate } from '../src/service/enforcer-delegate';
import { MODEL } from '../src/service/permission-model';
import { PluginPermissionMetadataCollector } from '../src/service/plugin-endpoints';
import {
  auditLoggerMock,
  catalogApiMock,
  conditionalStorageMock,
  csvPermFile,
  mockAuthService,
  mockClientKnex,
  pluginMetadataCollectorMock,
  roleMetadataStorageMock,
} from './mock-utils';

export function newConfig(
  permFile?: string,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
): Config {
  const testUsers = [
    {
      name: 'user:default/guest',
    },
    {
      name: 'group:default/guests',
    },
  ];

  return mockServices.rootConfig({
    data: {
      permission: {
        rbac: {
          'policies-csv-file': permFile || csvPermFile,
          policyFileReload: true,
          admin: {
            users: users || testUsers,
            superUsers: superUsers,
          },
        },
      },
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
    },
  });
}

export async function newAdapter(config: Config): Promise<Adapter> {
  return await new CasbinDBAdapterFactory(
    config,
    mockClientKnex,
  ).createAdapter();
}

export async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: LoggerService,
  config: Config,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const rbacDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogApiMock,
    logger,
    catalogDBClient,
    rbacDBClient,
    config,
    mockAuthService,
  );
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

export async function newEnforcerDelegate(
  adapter: Adapter,
  config: Config,
  storedPolicies?: string[][],
  storedGroupingPolicies?: string[][],
): Promise<EnforcerDelegate> {
  const theModel = newModelFromString(MODEL);
  const logger = mockServices.logger.mock();

  const enf = await createEnforcer(theModel, adapter, logger, config);

  if (storedPolicies) {
    await enf.addPolicies(storedPolicies);
  }

  if (storedGroupingPolicies) {
    await enf.addGroupingPolicies(storedGroupingPolicies);
  }

  return new EnforcerDelegate(enf, roleMetadataStorageMock, mockClientKnex);
}

export async function newPermissionPolicy(
  config: Config,
  enfDelegate: EnforcerDelegate,
  roleMock?: RoleMetadataStorage,
): Promise<RBACPermissionPolicy> {
  const logger = mockServices.logger.mock();
  const permissionPolicy = await RBACPermissionPolicy.build(
    logger,
    auditLoggerMock,
    config,
    conditionalStorageMock,
    enfDelegate,
    roleMock || roleMetadataStorageMock,
    mockClientKnex,
    pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
    mockAuthService,
  );
  auditLoggerMock.auditLog.mockReset();
  return permissionPolicy;
}
