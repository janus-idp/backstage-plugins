import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
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

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly enforcer: Enforcer;
  private readonly logger: Logger;

  public static async build(logger: Logger, policyAdapter: Adapter) {
    const theModel = newModelFromString(MODEL);

    const enf = await newEnforcer(theModel, policyAdapter);
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
        status = await this.enforcer.enforce(
          user?.identity.userEntityRef,
          request.permission.resourceType,
          action,
        );
      } else {
        status = await this.enforcer.enforce(
          user?.identity.userEntityRef,
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
}
