import { Config } from '@backstage/config';
import { ConfigApi } from '@backstage/core-plugin-api';
import {
  BackstageIdentityResponse,
  BackstageUserIdentity,
} from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  isResourcePermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

import { Adapter, Enforcer, newEnforcer, newModelFromString } from 'casbin';
import { Logger } from 'winston';

const MODEL = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))

[matchers]
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
`;

const useAdmins = (admins: Config[], enf: Enforcer) => {
  admins.flatMap(async localConfig => {
    const name = localConfig.getString('name');
    const adminReadPermission = [name, 'policy-entity', 'read', 'allow'];
    await enf.addPolicy(...adminReadPermission);
    const adminCreatePermission = [name, 'policy-entity', 'create', 'allow'];
    await enf.addPolicy(...adminCreatePermission);
  });
};

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly enforcer: Enforcer;
  private readonly logger: Logger;

  public static async build(
    logger: Logger,
    policyAdapter: Adapter,
    configApi: ConfigApi,
  ) {
    const theModel = newModelFromString(MODEL);

    const adminUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.users',
    );
    const enf = await newEnforcer(theModel, policyAdapter);

    if (adminUsers) {
      useAdmins(adminUsers, enf);
    }

    return new RBACPermissionPolicy(enf, logger);
  }

  private constructor(enforcer: Enforcer, logger: Logger) {
    this.enforcer = enforcer;
    this.logger = logger;
  }

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse | undefined,
  ): Promise<PolicyDecision> {
    this.logger.info(
      `Policy check for ${user?.identity.userEntityRef} for permission ${request.permission.name}`,
    );
    try {
      let status = false;

      // We are introducing an action named "use" when action does not exist to avoid
      // a more complicated model with multiple policy and request shapes.
      const action = request.permission.attributes.action ?? 'use';

      if (isResourcePermission(request.permission)) {
        status = await this.isAuthorized(
          user?.identity,
          request.permission.resourceType,
          action,
        );
      } else {
        status = await this.isAuthorized(
          user?.identity,
          request.permission.name,
          action,
        );
      }

      const result = status ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;
      this.logger.info(
        `${user?.identity.userEntityRef} is ${result} for permission ${request.permission.name}`,
      );
      return Promise.resolve({
        result: result,
      });
    } catch (error) {
      this.logger.error(`Policy check failed with ${error}`);
      return Promise.resolve({
        result: AuthorizeResult.DENY,
      });
    }
  }

  private isAuthorized = async (
    identity: BackstageUserIdentity | undefined,
    resourceType: string,
    action: string,
  ) => {
    let status;

    // Check if the group has access first
    const ownerStatus = await Promise.all(
      identity?.ownershipEntityRefs.map(async entityRef => {
        return await this.enforcer.enforce(entityRef, resourceType, action);
      }) || [],
    );

    status = ownerStatus.includes(true);

    // Check if the user has access
    if (!status) {
      status = await this.enforcer.enforce(
        identity?.userEntityRef,
        resourceType,
        action,
      );
    }

    return status;
  };
}
