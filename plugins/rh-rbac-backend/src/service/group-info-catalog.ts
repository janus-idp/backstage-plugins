import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

export type FilterRelations = 'relations.hasMember' | 'relations.parentOf';

export class GroupInfoCollector {
  constructor(private readonly catalogClient: CatalogClient) {}

  async getAncestorGroups(
    entityRefs: string[],
    fr?: FilterRelations,
    // todo: we should use Set instead fo array
    groups?: Entity[],
  ): Promise<Entity[]> {
    if (!groups) {
      // eslint-disable-next-line no-param-reassign
      groups = [];
    }
    if (!fr) {
      // eslint-disable-next-line no-param-reassign
      fr = 'relations.hasMember';
    }

    const { items } = await this.catalogClient.getEntities({
      filter: {
        kind: 'Group',
        [fr]: entityRefs,
      },
      // Save traffic with only required information for us
      fields: ['metadata.name', 'kind', 'metadata.namespace', 'spec.parent'],
    });

    const parentGroupsRefs: string[] = [];
    for (const item of items) {
      groups.push(item);
      if (item.spec && item.spec.parent) {
        parentGroupsRefs.push(
          `${item.kind.toLocaleLowerCase('en-US')}:${item.metadata.namespace}/${
            item.metadata.name
          }`,
        );
      }
    }

    if (parentGroupsRefs.length > 0) {
      await this.getAncestorGroups(
        parentGroupsRefs,
        'relations.parentOf',
        groups,
      );
    }

    return groups;
  }

  async getGroupUsers(groupRef: string): Promise<Entity[]> {
    const { items } = await this.catalogClient.getEntities({
      filter: {
        kind: 'User',
        ['relations.memberOf']: groupRef,
      },
      // Save traffic with only required information for us
      fields: ['metadata.name'],
    });

    return items;
  }
}
