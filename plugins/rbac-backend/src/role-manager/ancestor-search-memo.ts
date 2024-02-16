import { TokenManager } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

import { alg, Graph } from '@dagrejs/graphlib';
import { Logger } from 'winston';

// AncestorSearchMemo - should be used to build group hierarchy graph for User entity reference.
// It supports search group entity reference link in the graph.
// Also AncestorSearchMemo supports detection cycle dependencies between groups in the graph.
//
export class AncestorSearchMemo {
  private graph: Graph;

  private tokenManager: TokenManager;
  private catalogApi: CatalogApi;

  private userName: string;

  private allGroups: Entity[];

  constructor(
    userEntityRef: string,
    tokenManager: TokenManager,
    catalogApi: CatalogApi,
  ) {
    this.graph = new Graph({ directed: true });
    this.userName = userEntityRef.split('/')[1];
    this.tokenManager = tokenManager;
    this.catalogApi = catalogApi;
    this.allGroups = [];
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

  getNodes(): string[] {
    return this.graph.nodes();
  }

  async getAllGroups(): Promise<void> {
    const { token } = await this.tokenManager.getToken();
    const { items } = await this.catalogApi.getEntities(
      {
        filter: { kind: 'Group' },
        fields: [
          'metadata.name',
          'metadata.namespace',
          'spec.parent',
          'spec.members',
        ],
      },
      { token },
    );
    this.allGroups = items;
  }

  traverseGroups(memo: AncestorSearchMemo, group: Entity) {
    const groupsRefs = new Set<string>();
    const groupName = `group:${group.metadata.namespace?.toLocaleLowerCase(
      'en-US',
    )}/${group.metadata.name.toLocaleLowerCase('en-US')}`;
    if (!memo.hasEntityRef(group.metadata.name)) {
      memo.setNode(groupName);
    }

    const parent = group.spec?.parent as string;
    const parentGroup = this.allGroups.find(g => g.metadata.name === parent);

    if (parentGroup) {
      const parentName = `group:${group.metadata.namespace?.toLocaleLowerCase(
        'en-US',
      )}/${parent.toLocaleLowerCase('en-US')}`;
      memo.setEdge(parentName, groupName);
      groupsRefs.add(parentName);
    }

    if (groupsRefs.size > 0 && memo.isAcyclic()) {
      this.traverseGroups(memo, parentGroup!);
    }
  }

  async buildUserGraph(memo: AncestorSearchMemo) {
    const userGroups = this.allGroups.filter(group => {
      const members = group.spec?.members as string[];
      if (members && members.includes(this.userName)) {
        return true;
      }
      return false;
    });
    userGroups.forEach(group => this.traverseGroups(memo, group));
  }
}
