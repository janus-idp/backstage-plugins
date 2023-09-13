import { Entity } from '@backstage/catalog-model';
import { JsonArray } from '@backstage/types';

import {
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

    // add user permission
    if (await enforcer.hasPolicy(...permissionPolicy)) {
      // this policy should be unique
      await groupEnf.addPolicy(...permissionPolicy);
    }

    const userRef = permissionPolicy[0];
    const rule = permissionPolicy.slice(1);
    for (const group of groups) {
      // add group permission policies to group enforcer
      const groupRef = `group:default/${group.metadata.name}`;
      if (await enforcer.hasPolicy(groupRef, ...rule)) {
        await groupEnf.addPolicy(groupRef, ...rule);
      }

      // add group inheritance information to group enforcer
      if (group.spec && group.spec.parent) {
        const parentGroup = group.spec.parent.toString() || '';
        const parentGroupRef = `group:default/${parentGroup}`;
        await groupEnf.addGroupingPolicy(groupRef, parentGroupRef);
      }
    }

    // add information about user group membership to group enforcer
    if (user.spec && user.spec.memberOf) {
      const memberOfGroups = user.spec.memberOf as JsonArray; // todo: check if it is required array
      for (const group of memberOfGroups) {
        const groupRef = `group:default/${group}`;
        await groupEnf.addGroupingPolicy(userRef, groupRef);
      }
    }

    return groupEnf;
  }
}
