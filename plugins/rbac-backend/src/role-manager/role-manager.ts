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
   * addLink adds the inheritance link between name1 and role: name2.
   * aka name1 inherits role: name2.
   * domain is a prefix to the roles.
   * The link that is established is based on the defined grouping policies that
   * are added by the enforcer.
   *
   * ex. `g, name1, name2`.
   * @param name1 User or group that will be assigned to a role
   * @param name2 The role that will be created or updated
   * @param _domain Unimplemented
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
   * deleteLink deletes the inheritance link between name1 and role: name2.
   * aka name1 does not inherit role: name2 any more.
   * domain is a prefix to the roles.
   * The link that is deleted is based on the defined grouping policies that
   * are removed by the enforcer.
   *
   * ex. `g, name1, name2`.
   * @param name1 User or group that will be removed from assignment of a role
   * @param name2 The role that will be deleted or updated
   * @param _domain Unimplemented
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
      // this.roleCache.delete(name1);
      this.roleCache.deleteCacheWithRole(name2);
    }
  }

  /**
   * hasLink determines whether name1 inherits role: name2.
   * domain is a prefix to the roles.
   * During this check we build the group hierarchy graph to
   * determine if the particular user is directly or indirectly
   * attached to the role that we are receiving.
   * @param name1 The user that we are authorizing
   * @param name2 The name of the role that we are checking against
   * @param domain Unimplemented
   * @returns True if the user is directly or indirectly attached to the role
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

    // Check if are able to cache the user to the role to reduce the number
    // of times that we need to build the graph
    if (await this.cacheResults(name1)) {
      const cachedResult = this.roleCache?.get(name1)!;
      return cachedResult.has(name2);
    }

    // If the cache does not exist we need to build the graph and use it
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
    const { kind } = parseEntityRef(name);
    if (kind === 'user') {
      if (await this.cacheResults(name)) {
        const cachedResult = this.roleCache?.get(name)!;
        return Array.from(cachedResult);
      }

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

  /**
   * getOrCreateRole will get a role if it has already been cached
   * or it will create a new role to be cached.
   * This cache is a simple tree that is used to quickly compare
   * users and groups to roles.
   * @param name The user or group whose cache we will be getting / creating
   * @returns The cached role as a RoleList
   */
  private getOrCreateRole(name: string): RoleList {
    const role = this.allRoles.get(name);
    if (role) {
      return role;
    }
    const newRole = new RoleList(name);
    this.allRoles.set(name, newRole);

    return newRole;
  }

  /**
   * removeRole removes the role from the simple cache tree.
   * @param name The user or group who is cached within the tree
   */
  private removeRole(name: string): void {
    this.allRoles.delete(name);
  }

  // parse the entity to find out if it is a user / group / or role
  private parseEntityKind(name: string): string {
    const parsed = name.split(':');
    return parsed[0];
  }

  /**
   * nonCachedCheck attempts to check if a user's group hierarchy graph
   * and the simple cache tree contain the relevant information needed to
   * authorize a particular user.
   *
   * We iterate through the known roles within the cached tree to find
   * groups that are attached to the group hierarchy graph.
   *
   * We will then compare those groups and their roles in the cached tree to the roles and
   * the group hierarchy graph.
   * @param memo The group hierarchy graph
   * @param name2 The name of the role that we are authorizing with
   * @returns True if the group is present in the tree and attached to the role
   */
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

  /**
   * detectCycleError checks if there is a cycle dependency within the group hierarchy graph
   * and logs the information as a warning.
   * @param memo The group hierarchy graph
   * @param name1 The user that the hierarchy is based on
   * @returns True in the event that there is a cycle dependency present in the graph
   */
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

  /**
   * buildGraph will build an Ancestor Search Memo group hierarchy graph
   * based on the name of the user that is supplied.
   * @param name1 The name of the user
   * @returns The group hierarchy graph
   */
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

  /**
   * matchRoles will match the roles to the user and groups that are supplied.
   * @param userAndParentGroups The user and their associated groups
   * @returns The roles that are attached to the user and their groups
   */
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

  /**
   * cacheResults will return true if the role was cached
   * otherwise it will return false.
   * Prevent the role from being cached if there is a cycle dependency and return false.
   * @param name1 The user or group that we are caching to
   * @returns True if the user was cached
   */
  private async cacheResults(name1: string): Promise<boolean> {
    if (this.roleCache) {
      if (!this.roleCache.get(name1) || this.roleCache.shouldUpdate(name1)) {
        const memo = await this.buildGraph(name1);

        // We want to return false due to cycle dependency
        if (!this.detectCycleError(memo, name1)) {
          return false;
        }

        const roles = new Set(this.matchRoles(memo.getNodes()));

        this.roleCache?.put(name1, roles);
      }
      return true; // If the result does exist and should not be updated we still want to return true
    }
    return false;
  }
}
