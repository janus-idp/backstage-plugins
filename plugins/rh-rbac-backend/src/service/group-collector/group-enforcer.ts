import { Entity } from '@backstage/catalog-model';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import {
  Enforcer,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';

import { MODEL } from '../permission-model';
import { BackstageRoleManager } from '../role-manager';
import { GroupInfoCollector } from './group-info-catalog';

export class GroupCasbinEnforcerFactory {
  async build(
    enforcer: Enforcer,
    groups: Entity[],
    permissionPolicy: string[],
    groupInfo: GroupInfoCollector,
  ): Promise<Enforcer> {
    const groupEnf = await newEnforcer();
    await groupEnf.initWithModelAndAdapter(
      newModelFromString(MODEL),
      new StringAdapter(``),
      true,
    );

    const rm = new BackstageRoleManager(groupInfo);
    groupEnf.setRoleManager(rm);
    groupEnf.enableAutoBuildRoleLinks(false);
    await groupEnf.buildRoleLinks();

    await this.copyPermissionPolicy(
      permissionPolicy,
      enforcer,
      groupEnf,
      groups,
    );

    return groupEnf;
  }

  private async copyPermissionPolicy(
    permissionPolicy: string[],
    enforcer: Enforcer,
    groupEnf: Enforcer,
    groups: Entity[],
  ) {
    for (const effect of [AuthorizeResult.DENY, AuthorizeResult.ALLOW]) {
      const policy = [...permissionPolicy, effect.toLocaleLowerCase()];

      // copy user permission policy
      if (await enforcer.hasPolicy(...policy)) {
        await groupEnf.addPolicy(...policy);
      }

      const rule = policy.slice(1); // make copy policy without first element - username
      for (const group of groups) {
        // copy group permission policy to group enforcer
        const groupRef = `group:default/${group.metadata.name.toLocaleLowerCase()}`;
        if (await enforcer.hasPolicy(groupRef, ...rule)) {
          await groupEnf.addPolicy(groupRef, ...rule);
        }
      }
    }
  }
}
