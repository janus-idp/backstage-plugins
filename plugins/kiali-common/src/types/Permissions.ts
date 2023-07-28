import { ComputedServerConfig } from './';

export interface ResourcePermissions {
  create: boolean;
  update: boolean;
  delete: boolean;
}

export function canCreate(
  serverConfig: ComputedServerConfig,
  privs?: ResourcePermissions,
) {
  return privs?.create && !serverConfig.deployment.viewOnlyMode;
}

export function canUpdate(
  serverConfig: ComputedServerConfig,
  privs?: ResourcePermissions,
) {
  return privs?.update && !serverConfig.deployment.viewOnlyMode;
}

export function canDelete(
  serverConfig: ComputedServerConfig,
  privs?: ResourcePermissions,
) {
  return privs?.delete && !serverConfig.deployment.viewOnlyMode;
}
