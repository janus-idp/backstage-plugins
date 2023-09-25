import { CatalogApi } from '@backstage/catalog-client';
import { Entity, parseEntityRef } from '@backstage/catalog-model';

import { RoleManager } from 'casbin';

type FilterRelations = 'relations.hasMember' | 'relations.parentOf';

export class BackstageRoleManager implements RoleManager {
  constructor(private readonly catalogApi: CatalogApi) {}

  /**
   * clear clears all stored data and resets the role manager to the initial state.
   */
  async clear(): Promise<void> {
    // do nothing
  }

  /**
   * addLink adds the inheritance link between role: name1 and role: name2.
   * aka role: name1 inherits role: name2.
   * domain is a prefix to the roles.
   */
  async addLink(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): Promise<void> {
    throw new Error('Method "addLink" not implemented.');
  }

  /**
   * deleteLink deletes the inheritance link between role: name1 and role: name2.
   * aka role: name1 does not inherit role: name2 any more.
   * domain is a prefix to the roles.
   */
  async deleteLink(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): Promise<void> {
    throw new Error('Method "deleteLink" not implemented.');
  }

  /**
   * hasLink determines whether role: name1 inherits role: name2.
   * domain is a prefix to the roles.
   */
  async hasLink(
    name1: string,
    name2: string,
    ...domain: string[]
  ): Promise<boolean> {
    if (domain.length > 0) {
      throw new Error('domain argument is not supported.');
    }

    if (name1 === name2) {
      return true;
    }

    // name1 is always user in our case.
    // name2 is user or group.
    // user(name1) couldn't inherit user(name2).
    // We can use this fact for optimization.
    const { kind } = parseEntityRef(name2);
    if (kind.toLocaleLowerCase() === 'user') {
      return false;
    }

    // optimization: don't make request if name2 is user...
    const role = await this.findAncestorGroup(
      [name1],
      name2,
      'relations.hasMember',
    );
    return !!role;
  }

  /**
   * syncedHasLink determines whether role: name1 inherits role: name2.
   * domain is a prefix to the roles.
   */
  syncedHasLink?(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): boolean {
    throw new Error('Method "syncedHasLink" not implemented.');
  }

  /**
   * getRoles gets the roles that a subject inherits.
   * domain is a prefix to the roles.
   */
  async getRoles(_name: string, ..._domain: string[]): Promise<string[]> {
    throw new Error('Method "getRoles" not implemented.');
  }

  /**
   * getUsers gets the users that inherits a subject.
   * domain is an unreferenced parameter here, may be used in other implementations.
   */
  async getUsers(_name: string, ..._domain: string[]): Promise<string[]> {
    throw new Error('Method "getUsers" not implemented.');
  }

  /**
   * printRoles prints all the roles to log.
   */
  async printRoles(): Promise<void> {
    // do nothing
  }

  private async findAncestorGroup(
    entityRefs: string[],
    groupToSearch: string,
    fr: FilterRelations,
  ): Promise<Entity | undefined> {
    const { items } = await this.catalogApi.getEntities({
      filter: {
        kind: 'Group',
        [fr]: Array.from(entityRefs),
      },
      // Save traffic with only required information for us
      fields: ['metadata.name', 'kind', 'metadata.namespace', 'spec.parent'],
    });

    const groupsRefs = new Set<string>();
    for (const item of items) {
      const groupRef = `group:default/${item.metadata.name.toLocaleLowerCase()}`;
      if (groupRef === groupToSearch) {
        return item;
      }
      if (item.spec && item.spec.parent) {
        groupsRefs.add(groupRef);
      }
    }

    if (groupsRefs.size > 0) {
      return await this.findAncestorGroup(
        Array.from(groupsRefs),
        groupToSearch,
        'relations.parentOf',
      );
    }

    return undefined;
  }
}
