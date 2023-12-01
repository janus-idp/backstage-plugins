import { CompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Role, RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

export function validatePolicy(policy: RoleBasedPolicy): Error | undefined {
  const err = validateEntityReference(policy.entityReference);
  if (err) {
    return err;
  }

  if (!policy.permission) {
    return new Error(`'permission' field must not be empty`);
  }

  if (!policy.policy) {
    return new Error(`'policy' field must not be empty`);
  }

  if (!policy.effect) {
    return new Error(`'effect' field must not be empty`);
  } else if (!isValidEffectValue(policy.effect)) {
    return new Error(
      `'effect' has invalid value: '${
        policy.effect
      }'. It should be: '${AuthorizeResult.ALLOW.toLocaleLowerCase()}' or '${AuthorizeResult.DENY.toLocaleLowerCase()}'`,
    );
  }

  return undefined;
}

export function validateRole(role: Role): Error | undefined {
  if (!role.name) {
    return new Error(`'name' field must not be empty`);
  }

  if (!role.memberReferences || role.memberReferences.length === 0) {
    return new Error(`'memberReferences' field must not be empty`);
  }

  for (const member of role.memberReferences) {
    const err = validateEntityReference(member);
    if (err) {
      return err;
    }
  }
  return undefined;
}

function isValidEffectValue(effect: string): boolean {
  return (
    effect === AuthorizeResult.ALLOW.toLocaleLowerCase() ||
    effect === AuthorizeResult.DENY.toLocaleLowerCase()
  );
}

// We supports only full form entity reference: [<kind>:][<namespace>/]<name>
export function validateEntityReference(entityRef?: string): Error | undefined {
  if (!entityRef) {
    return new Error(`'entityReference' must not be empty`);
  }

  let entityRefCompound: CompoundEntityRef;
  try {
    entityRefCompound = parseEntityRef(entityRef);
  } catch (err) {
    return err as Error;
  }

  const entityRefFull = `${entityRefCompound.kind}:${entityRefCompound.namespace}/${entityRefCompound.name}`;
  if (entityRefFull !== entityRef) {
    return new Error(
      `entity reference '${entityRef}' does not match the required format [<kind>:][<namespace>/]<name>. Provide, please, full entity reference.`,
    );
  }

  if (
    entityRefCompound.kind !== 'user' &&
    entityRefCompound.kind !== 'group' &&
    entityRefCompound.kind !== 'role'
  ) {
    return new Error(
      `Unsupported kind ${entityRefCompound.kind}. List supported values ["user", "group", "role"]`,
    );
  }

  return undefined;
}
