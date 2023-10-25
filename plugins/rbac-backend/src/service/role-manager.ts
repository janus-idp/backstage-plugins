import { TokenManager } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { parseEntityRef } from '@backstage/catalog-model';

import { alg, Graph } from '@dagrejs/graphlib';
import { RoleManager } from 'casbin';
import { Logger } from 'winston';

type FilterRelations = 'relations.hasMember' | 'relations.parentOf';

class Role {
  public name: string;

  private roles: Role[];

  public constructor(name: string) {
    this.name = name;
    this.roles = [];
  }

  public addRole(role: Role): void {
    if (this.roles.some(n => n.name === role.name)) {
      return;
    }
    this.roles.push(role);
  }

  public deleteRole(role: Role): void {
    this.roles = this.roles.filter(n => n.name !== role.name);
  }

  public hasRole(name: string, hierarchyLevel: number): boolean {
    if (this.name === name) {
      return true;
    }
    if (hierarchyLevel <= 0) {
      return false;
    }
    for (const role of this.roles) {
      if (role.hasRole(name, hierarchyLevel - 1)) {
        return true;
      }
    }

    return false;
  }
}

// AncestorSearchMemo - should be used to build group hierarchy graph for User entity reference.
// It supports search group entity reference link in the graph.
// Also AncestorSearchMemo supports detection cycle dependencies between groups in the graph.
//
// Notice: this class should be used like cache object in the nearest feature.
// This cache can be implemented with time expiration and it can be map: Map<userEntityRef, AncestorSearchMemo>.
class AncestorSearchMemo {
  private filterEntityRefs: Set<string>;

  private graph: Graph;
  private fr: FilterRelations;

  constructor(userEntityRef: string) {
    this.filterEntityRefs = new Set<string>([userEntityRef]);
    this.graph = new Graph({ directed: true });
    this.fr = 'relations.hasMember';
  }

  setFilterEntityRefs(entityRefs: Set<string>) {
    this.filterEntityRefs = entityRefs;
  }

  getFilterEntityRefs(): Set<string> {
    return this.filterEntityRefs;
  }

  setFilterRelations(fr: FilterRelations): void {
    this.fr = fr;
  }

  getFilterRelations(): FilterRelations {
    return this.fr;
  }

  isAcyclic(): boolean {
    return alg.isAcyclic(this.graph);
  }

  findCycles(): string[][] {
    return alg.findCycles(this.graph);
  }

  setEdge(parentEntityRef: string, childEntityRef: string) {
    this.graph.setEdge(parentEntityRef, childEntityRef);
  }

  setNode(entityRef: string): void {
    this.graph.setNode(entityRef);
  }

  hasEntityRef(groupRef: string): boolean {
    return this.graph.hasNode(groupRef);
  }

  debugNodesAndEdges(log: Logger, userEntity: string): void {
    log.debug(
      `SubGraph edges: ${JSON.stringify(this.graph.edges())} for ${userEntity}`,
    );
    log.debug(
      `SubGraph nodes: ${JSON.stringify(this.graph.nodes())} for ${userEntity}`,
    );
  }
}

export class BackstageRoleManager implements RoleManager {
  private allRoles: Map<string, Role>;
  constructor(
    private readonly catalogApi: CatalogApi,
    private readonly log: Logger,
    private readonly tokenManager: TokenManager,
  ) {
    this.allRoles = new Map<string, Role>();
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
    // name2 is user or group.
    // user(name1) couldn't inherit user(name2).
    // We can use this fact for optimization.
    const { kind } = parseEntityRef(name2);
    if (kind.toLocaleLowerCase() === 'user') {
      return false;
    }

    const memo = new AncestorSearchMemo(name1);
    await this.findAncestorGroups(memo);
    memo.debugNodesAndEdges(this.log, name1);
    if (!memo.isAcyclic()) {
      const cycles = memo.findCycles();

      this.log.warn(
        `Detected cycle ${
          cycles.length > 0 ? 'dependencies' : 'dependency'
        } in the Group graph: ${JSON.stringify(
          cycles,
        )}. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for group: ${name2}`,
      );

      return false;
    }

    // iterate through the known roles to check if the second name is apart of the known roles
    // and if the group that is attached to the second name is apart of the graph
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

  private async findAncestorGroups(memo: AncestorSearchMemo): Promise<void> {
    const { token } = await this.tokenManager.getToken();
    const { items } = await this.catalogApi.getEntities(
      {
        filter: {
          kind: 'Group',
          [memo.getFilterRelations()]: Array.from(memo.getFilterEntityRefs()),
        },
        // Save traffic with only required information for us
        fields: [
          'metadata.name',
          'kind',
          'metadata.namespace',
          'spec.parent',
          'spec.children',
        ],
      },
      { token },
    );

    const groupsRefs = new Set<string>();
    for (const item of items) {
      const groupRef = `group:default/${item.metadata.name.toLocaleLowerCase()}`;

      memo.setNode(groupRef);
      for (const child of (item.spec?.children as string[]) ?? []) {
        const childEntityRef = `group:default/${child.toLocaleLowerCase()}`;
        if (
          memo.getFilterEntityRefs().has(childEntityRef) ||
          memo.getFilterRelations() === 'relations.hasMember'
        ) {
          memo.setEdge(groupRef, childEntityRef);
        }
      }

      if (item.spec?.parent) {
        const parentRef = `group:default/${(
          item.spec?.parent as string
        ).toLocaleLowerCase()}`;
        memo.setEdge(parentRef, groupRef);
        groupsRefs.add(groupRef);
      }
    }

    if (groupsRefs.size > 0 && memo.isAcyclic()) {
      memo.setFilterEntityRefs(groupsRefs);
      memo.setFilterRelations('relations.parentOf');
      await this.findAncestorGroups(memo);
    }
  }

  private getOrCreateRole(name: string): Role {
    const role = this.allRoles.get(name);
    if (role) {
      return role;
    }
    const newRole = new Role(name);
    this.allRoles.set(name, newRole);

    return newRole;
  }

  // parse the entity to find out if it is a user / group / or role
  private parseEntityKind(name: string): string {
    const parsed = name.split(':');
    return parsed[0];
  }
}
