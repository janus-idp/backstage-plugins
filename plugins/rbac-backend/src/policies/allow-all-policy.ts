import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

export class AllowAllPolicy implements PermissionPolicy {
  async handle(
    _request: PolicyQuery,
    _user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    return { result: AuthorizeResult.ALLOW };
  }
}
