import { Entity } from '@backstage/catalog-model';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { JsonArray } from '@backstage/types';

import {
  DefaultRoleManager,
  Enforcer,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';

import { MODEL } from '../permission-model';

export class GroupCasbinEnforcerFactory {
  async build(
    enforcer: Enforcer,
    user: Entity,
    groups: Entity[],
    permissionPolicy: string[],
  ): Promise<Enforcer> {
    const groupEnf = await newEnforcer();
    await groupEnf.initWithModelAndAdapter(
      newModelFromString(MODEL),
      new StringAdapter(``),
      true,
    );

    // todo: make it configurable
    const rm = new DefaultRoleManager(10);
    groupEnf.setRoleManager(rm);
    groupEnf.enableAutoBuildRoleLinks(false);
    await groupEnf.buildRoleLinks();

    for (const effect of [AuthorizeResult.DENY, AuthorizeResult.ALLOW]) {
      const policy = [...permissionPolicy, effect.toLocaleLowerCase()];

      // copy user permission policy
      if (await enforcer.hasPolicy(...policy)) {
        await groupEnf.addPolicy(...policy);
      }

      const rule = policy.slice(1);
      for (const group of groups) {
        // copy group permission policy to group enforcer
        const groupRef = `group:default/${group.metadata.name}`;
        if (await enforcer.hasPolicy(groupRef, ...rule)) {
          await groupEnf.addPolicy(groupRef, ...rule);
        }
      }
    }

    for (const group of groups) {
      // add group inheritance information to the role manager
      if (group.spec && group.spec.parent) {
        const groupRef = `group:default/${group.metadata.name}`;
        const parentGroup = group.spec.parent.toString() || '';
        const parentGroupRef = `group:default/${parentGroup}`;

        await rm.addLink(groupRef, parentGroupRef);
      }
    }

    const userRef = permissionPolicy[0];
    // add information about user group membership to group enforcer
    if (user.spec && user.spec.memberOf) {
      const memberOfGroups = user.spec.memberOf as JsonArray; // todo: check if it is required array
      for (const group of memberOfGroups) {
        const groupRef = `group:default/${group}`;
        await rm.addLink(userRef, groupRef);
      }
    }

    return groupEnf;
  }
}
