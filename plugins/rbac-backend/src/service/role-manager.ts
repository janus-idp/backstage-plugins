import { CatalogApi } from '@backstage/catalog-client';
import { parseEntityRef } from '@backstage/catalog-model';

import { alg, Graph } from '@dagrejs/graphlib';
import { RoleManager } from 'casbin';

type FilterRelations = 'relations.hasMember' | 'relations.parentOf';

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
    console.log(`=== Edges: ${JSON.stringify(this.graph.edges())}`);
    if (this.graph.edges().length === 0) {
      console.log(`=== Nodes: ${JSON.stringify(this.graph.nodes())}`);
    }

    return this.graph.hasNode(groupRef);
  }
}

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

    const memo = new AncestorSearchMemo(name1);
    await this.findAncestorGroups(memo);
    if (!memo.isAcyclic()) {
      const cycles = memo.findCycles();
      console.log(
        `Detected cycle ${
          cycles.length > 0 ? 'dependencies' : 'dependency'
        } in the Group graph: ${JSON.stringify(
          cycles,
        )}. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for group: ${name2}`,
      );
      return false;
    }
    const result = memo.hasEntityRef(name2);
    console.log(`======result is ${name1} ${name2} ${result}`);
    return result;
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
    const { items } = await this.catalogApi.getEntities({
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
    });

    console.log(
      `=== filter: ${memo.getFilterRelations()} of ${Array.from(
        memo.getFilterEntityRefs(),
      )}, parents: ${JSON.stringify(items)}`,
    );

    const groupsRefs = new Set<string>();
    for (const item of items) {
      const groupRef = `group:default/${item.metadata.name.toLocaleLowerCase()}`;

      memo.setNode(groupRef);
      for (const child of (item.spec?.children as string[]) ?? []) {
        const childEntityRef = `group:default/${child.toLocaleLowerCase()}`;
        if (memo.getFilterEntityRefs().has(childEntityRef)) {
          console.log(`set Edge: ${groupRef} ${childEntityRef}`);
          memo.setEdge(groupRef, childEntityRef);
        }
      }

      if (item.spec?.parent) {
        groupsRefs.add(groupRef);
      }
    }

    if (groupsRefs.size > 0 && memo.isAcyclic()) {
      memo.setFilterEntityRefs(groupsRefs);
      memo.setFilterRelations('relations.parentOf');
      console.log(`=== next iteration...`);
      await this.findAncestorGroups(memo);
    }
  }
}
