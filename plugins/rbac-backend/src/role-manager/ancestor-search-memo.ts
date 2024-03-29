import { TokenManager } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

import { alg, Graph } from '@dagrejs/graphlib';
import { Knex } from 'knex';
import { Logger } from 'winston';

export interface Relation {
  source_entity_ref: string;
  target_entity_ref: string;
}

export type ASMGroup = Relation | Entity;

// AncestorSearchMemo - should be used to build group hierarchy graph for User entity reference.
// It supports search group entity reference link in the graph.
// Also AncestorSearchMemo supports detection cycle dependencies between groups in the graph.
//
export class AncestorSearchMemo {
  private graph: Graph;

  private tokenManager: TokenManager;
  private catalogApi: CatalogApi;
  private catalogDBClient: Knex;

  private userEntityRef: string;

  constructor(
    userEntityRef: string,
    tokenManager: TokenManager,
    catalogApi: CatalogApi,
    catalogDBClient: Knex,
  ) {
    this.graph = new Graph({ directed: true });
    this.userEntityRef = userEntityRef;
    this.tokenManager = tokenManager;
    this.catalogApi = catalogApi;
    this.catalogDBClient = catalogDBClient;
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

  async doesRelationTableExist(): Promise<boolean> {
    try {
      return await this.catalogDBClient.schema.hasTable('relations');
    } catch (error) {
      return false;
    }
  }

  async getAllGroups(): Promise<ASMGroup[]> {
    const { token } = await this.tokenManager.getToken();
    const { items } = await this.catalogApi.getEntities(
      {
        filter: { kind: 'Group' },
        fields: ['metadata.name', 'metadata.namespace', 'spec.parent'],
      },
      { token },
    );
    return items;
  }

  async getAllRelations(): Promise<ASMGroup[]> {
    try {
      const rows = await this.catalogDBClient('relations')
        .select('source_entity_ref', 'target_entity_ref')
        .where('type', 'childOf');
      return rows;
    } catch (error) {
      return [];
    }
  }

  async getUserGroups(): Promise<ASMGroup[]> {
    const { token } = await this.tokenManager.getToken();
    const { items } = await this.catalogApi.getEntities(
      {
        filter: { kind: 'Group', 'relations.hasMember': this.userEntityRef },
        fields: ['metadata.name', 'metadata.namespace', 'spec.parent'],
      },
      { token },
    );
    return items;
  }

  async getUserRelations(): Promise<ASMGroup[]> {
    try {
      const rows = await this.catalogDBClient('relations')
        .select('source_entity_ref', 'target_entity_ref')
        .where({ type: 'memberOf', source_entity_ref: this.userEntityRef });
      return rows;
    } catch (error) {
      return [];
    }
  }

  traverseGroups(memo: AncestorSearchMemo, group: Entity, allGroups: Entity[]) {
    const groupsRefs = new Set<string>();
    const groupName = `group:${group.metadata.namespace?.toLocaleLowerCase(
      'en-US',
    )}/${group.metadata.name.toLocaleLowerCase('en-US')}`;
    if (!memo.hasEntityRef(groupName)) {
      memo.setNode(groupName);
    }

    const parent = group.spec?.parent as string;
    const parentGroup = allGroups.find(g => g.metadata.name === parent);

    if (parentGroup) {
      const parentName = `group:${group.metadata.namespace?.toLocaleLowerCase(
        'en-US',
      )}/${parent.toLocaleLowerCase('en-US')}`;
      memo.setEdge(parentName, groupName);
      groupsRefs.add(parentName);
    }

    if (groupsRefs.size > 0 && memo.isAcyclic()) {
      this.traverseGroups(memo, parentGroup!, allGroups);
    }
  }

  traverseRelations(
    memo: AncestorSearchMemo,
    relation: Relation,
    allRelations: Relation[],
  ) {
    if (!memo.hasEntityRef(relation.source_entity_ref)) {
      memo.setNode(relation.source_entity_ref);
    }

    memo.setEdge(relation.target_entity_ref, relation.source_entity_ref);

    const parentGroup = allRelations.find(
      g => g.source_entity_ref === relation.target_entity_ref,
    );

    if (parentGroup && memo.isAcyclic()) {
      this.traverseRelations(memo, parentGroup!, allRelations);
    }
  }

  async buildUserGraph(memo: AncestorSearchMemo) {
    if (await this.doesRelationTableExist()) {
      const userRelations = await this.getUserRelations();
      const allRelations = await this.getAllRelations();
      userRelations.forEach(group =>
        this.traverseRelations(
          memo,
          group as Relation,
          allRelations as Relation[],
        ),
      );
    } else {
      const userGroups = await this.getUserGroups();
      const allGroups = await this.getAllGroups();
      userGroups.forEach(group =>
        this.traverseGroups(memo, group as Entity, allGroups as Entity[]),
      );
    }
  }
}
