import { TokenManager } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { parseEntityRef } from '@backstage/catalog-model';
import { Config } from '@backstage/config';

import { RoleManager } from 'casbin';
import { Knex } from 'knex';
import { Logger } from 'winston';

import { AncestorSearchMemo } from './ancestor-search-memo';
import { RoleCache } from './role-cache';
import { RoleList } from './role-list';

export class BackstageRoleManager implements RoleManager {
  private allRoles: Map<string, RoleList>;
  private roleCache?: RoleCache;
  constructor(
    private readonly catalogApi: CatalogApi,
    private readonly log: Logger,
    private readonly tokenManager: TokenManager,
    private readonly catalogDBClient: Knex,
    private readonly config: Config,
  ) {
    this.allRoles = new Map<string, RoleList>();
    const cache = this.config.getOptionalConfig('permission.rbac.cache');
    if (cache) {
      const maxSize = cache.getOptionalNumber('maxSize');
      const expiration = cache.getOptionalNumber('expiration');
      this.roleCache = new RoleCache(maxSize, expiration);
    }
  }

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
    name1: string,
    name2: string,
    ..._domain: string[]
  ): Promise<void> {
    const role1 = this.getOrCreateRole(name1);
    const role2 = this.getOrCreateRole(name2);

    role1.addRole(role2);
    this.removeRole(name2);
  }

  /**
   * deleteLink deletes the inheritance link between role: name1 and role: name2.
   * aka role: name1 does not inherit role: name2 any more.
   * domain is a prefix to the roles.
   */
  async deleteLink(
    name1: string,
    name2: string,
    ..._domain: string[]
  ): Promise<void> {
    const role1 = this.getOrCreateRole(name1);
    const role2 = this.getOrCreateRole(name2);
    role1.deleteRole(role2);
    this.removeRole(name2);

    if (this.roleCache) {
      this.roleCache.delete(name1);
    }
  }

  /**
   * hasLink determines whether role: name1 inherits role: name2.
   * domain is a prefix to the roles.
   *
   * name1 will always be the user that we are authorizing
   * name2 will be the roles that the role manager is aware of
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

    const tempRole = this.getOrCreateRole(name1);

    // Immediately check if the our temporary role has a link with the role that we are comparing it to
    if (this.parseEntityKind(name2) === 'role' && tempRole.hasRole(name2, 1)) {
      return true;
    }

    // name1 is always user in our case.
    // name2 is role or group.
    // user(name1) couldn't inherit user(name2).
    // We can use this fact for optimization.
    const { kind } = parseEntityRef(name2);
    if (kind.toLocaleLowerCase() === 'user') {
      return false;
    }

    await this.cacheResults(name1);
    if (this.roleCache) {
      const cachedResult = this.roleCache.get(name1)!;

      return cachedResult.has(name2);
    }

    // If the cache does not exist we need to build the graph and use it
    // Otherwise we need to use the cache instead
    const memo = await this.buildGraph(name1);

    if (!this.detectCycleError(memo, name1)) {
      return false;
    }

    return this.nonCachedCheck(memo, name2);
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
   *
   * name - is a string entity reference, for example: user:default/tom, role:default/dev,
   * so format is <kind>:<namespace>/<entity-name>.
   * GetRoles method supports only two kind values: 'user' and 'role'.
   *
   * domain - is a prefix to the roles, unused parameter.
   *
   * If name's kind === 'user' we return all inherited roles from groups and roles directly assigned to the user.
   * if name's kind === 'role' we return empty array, because we don't support role inheritance.
   * Case kind === 'group' - should not happen, because:
   * 1) Method getRoles returns only role entity references, so casbin engine doesn't call this
   * method again to ask about name with kind "group".
   * 2) We implemented getRoles method only to use:
   * 'await enforcer.getImplicitPermissionsForUser(userEntityRef)',
   * so name argument can be only with kind 'user' or 'role'.
   *
   * Info: when we call 'await enforcer.getImplicitPermissionsForUser(userEntityRef)',
   * then casbin engine executes 'getRoles' method few times.
   * Firstly casbin asks about roles for 'userEntityRef'.
   * Let's imagine, that 'getRoles' returned two roles for userEntityRef.
   * Then casbin calls 'getRoles' two more times to
   * find parent roles. But we return empty array for each such call,
   * because we don't support role inheritance and we notify casbin about end of the role sub-tree.
   */
  async getRoles(name: string, ..._domain: string[]): Promise<string[]> {
    await this.cacheResults(name);
    if (this.roleCache) {
      const cachedResult = this.roleCache.get(name)!;

      return Array.from(cachedResult);
    }

    const { kind } = parseEntityRef(name);
    if (kind === 'user') {
      const memo = await this.buildGraph(name);
      const userAndParentGroups = memo.getNodes();
      userAndParentGroups.push(name);

      return this.matchRoles(userAndParentGroups);
    }

    return [];
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

  private getOrCreateRole(name: string): RoleList {
    const role = this.allRoles.get(name);
    if (role) {
      return role;
    }
    const newRole = new RoleList(name);
    this.allRoles.set(name, newRole);

    return newRole;
  }

  private removeRole(name: string): void {
    this.allRoles.delete(name);
  }

  // parse the entity to find out if it is a user / group / or role
  private parseEntityKind(name: string): string {
    const parsed = name.split(':');
    return parsed[0];
  }

  private nonCachedCheck(memo: AncestorSearchMemo, name2: string): boolean {
    if (!memo.hasEntityRef(name2) && this.parseEntityKind(name2) === 'role') {
      for (const [key, value] of this.allRoles.entries()) {
        if (value.hasRole(name2, 1) && memo.hasEntityRef(key)) {
          return true;
        }
      }
    }
    return memo.hasEntityRef(name2);
  }

  private detectCycleError(memo: AncestorSearchMemo, name1: string): boolean {
    memo.debugNodesAndEdges(this.log, name1);
    if (!memo.isAcyclic()) {
      const cycles = memo.findCycles();

      this.log.warn(
        `Detected cycle dependencies in the Group graph: ${JSON.stringify(
          cycles,
        )}. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: ${JSON.stringify(
          cycles,
        )}`,
      );

      return false;
    }
    return true;
  }

  private async buildGraph(name1: string): Promise<AncestorSearchMemo> {
    const memo = new AncestorSearchMemo(
      name1,
      this.tokenManager,
      this.catalogApi,
      this.catalogDBClient,
    );
    await memo.buildUserGraph(memo);

    memo.debugNodesAndEdges(this.log, name1);
    return memo;
  }

  private matchRoles(userAndParentGroups: string[]): string[] {
    const allRoles: string[] = [];
    for (const userOrParentGroup of userAndParentGroups) {
      const r = this.allRoles.get(userOrParentGroup);
      if (r) {
        const rolesEntityRefs = [...r.getRoles()]
          .filter(role => {
            return role.name.startsWith('role:default');
          })
          .map(role => role.name);

        allRoles.push(...rolesEntityRefs);
      }
    }
    return allRoles;
  }

  private async cacheResults(name1: string): Promise<boolean> {
    if (this.roleCache) {
      if (!this.roleCache.get(name1) || this.roleCache.shouldUpdate(name1)) {
        const memo = await this.buildGraph(name1);

        if (this.detectCycleError(memo, name1)) {
          const roles = new Set(this.matchRoles(memo.getNodes()));

          this.roleCache?.put(name1, roles);

          return true;
        }
      }
    }
    return false;
  }
}
