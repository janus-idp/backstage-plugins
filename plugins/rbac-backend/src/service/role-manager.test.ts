import { CatalogApi } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

import { BackstageRoleManager } from './role-manager';

describe('BackstageRoleManager', () => {
  const catalogApi: any = {
    getEntities: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ items: [] })),
  };

  const roleManager = new BackstageRoleManager(catalogApi as CatalogApi);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unimplemented methods', () => {
    it('should throw an error for addLink', async () => {
      await expect(
        roleManager.addLink('user:default/role1', 'user:default/role2'),
      ).rejects.toThrow('Method "addLink" not implemented.');
    });

    it('should throw an error for deleteLink', async () => {
      await expect(
        roleManager.deleteLink('user:default/role1', 'user:default/role2'),
      ).rejects.toThrow('Method "deleteLink" not implemented.');
    });

    it('should throw an error for syncedHasLink', () => {
      expect(() =>
        roleManager.syncedHasLink!('user:default/role1', 'user:default/role2'),
      ).toThrow('Method "syncedHasLink" not implemented.');
    });

    it('should throw an error for getRoles', async () => {
      await expect(roleManager.getRoles('name')).rejects.toThrow(
        'Method "getRoles" not implemented.',
      );
    });

    it('should throw an error for getUsers', async () => {
      await expect(roleManager.getUsers('name')).rejects.toThrow(
        'Method "getUsers" not implemented.',
      );
    });
  });

  describe('hasLink tests', () => {
    it('should return true for hasLink when names are the same', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'user:default/mike',
      );
      expect(result).toBe(true);
    });

    it('should return false for hasLink when name2 has a user kind', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'user:default/some-user',
      );
      expect(result).toBe(false);
    });

    // user:default/mike should not inherits from group:default/somegroup
    //
    //     Hierarchy:
    //
    // user:default/mike -> user without group
    //
    it('should return false for hasLink when user without group', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/somegroup',
      );
      expect(catalogApi.getEntities).toHaveBeenCalledWith({
        filter: {
          kind: 'Group',
          'relations.hasMember': ['user:default/mike'],
        },
        fields: ['metadata.name', 'kind', 'metadata.namespace', 'spec.parent'],
      });
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/somegroup
    //
    //     Hierarchy:
    //
    // group:default/somegroup
    //          |
    //  user:default/mike
    //
    it('should return true for hasLink when user:default/mike inherits from group:default/somegroup', async () => {
      const entityMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'somegroup',
          namespace: 'default',
        },
      };
      catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/somegroup',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should not inherits from group:default/somegroup
    //
    //     Hierarchy:
    //
    // group:default/not-matched-group
    //         |
    // user:default/mike
    //
    it('should return false for hasLink when user:default/mike does not inherits group:default/somegroup', async () => {
      const entityMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'not-matched-group',
          namespace: 'default',
        },
      };
      catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/somegroup',
      );
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/team-a
    //
    //     Hierarchy:
    //
    // group:default/team-a
    //       |
    // group:default/team-b
    //       |
    // user:default/mike
    //
    it('should return true for hasLink, when user:default/mike inherits from group:default/team-a', async () => {
      const groupMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-b',
          namespace: 'default',
        },
        spec: {
          parent: 'group:default/team-a',
        },
      };

      const groupParentMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-a',
          namespace: 'default',
        },
      };

      catalogApi.getEntities.mockImplementation((arg: any) => {
        const hasMember = arg.filter['relations.hasMember'];
        if (hasMember && hasMember[0] === 'user:default/mike') {
          return { items: [groupMock] };
        }
        const hasParent = arg.filter['relations.parentOf'];
        if (hasParent && hasParent[0] === 'group:default/team-b') {
          return { items: [groupParentMock] };
        }
        return { items: [] };
      });

      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-a',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should inherits from group:default/team-c?
    //
    //     Hierarchy:
    //
    // group:default/team-a
    //       |
    // group:default/team-b
    //       |
    // user:default/mike
    //
    it('should return false for hasLink, when user:default/mike does not inherits from group:default/team-c', async () => {
      const groupMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-b',
          namespace: 'default',
        },
        spec: {
          parent: 'group:default/team-a',
        },
      };

      const groupParentMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-a',
          namespace: 'default',
        },
      };

      catalogApi.getEntities.mockImplementation((arg: any) => {
        const hasMember = arg.filter['relations.hasMember'];
        if (hasMember && hasMember[0] === 'user:default/mike') {
          return { items: [groupMock] };
        }
        const hasParent = arg.filter['relations.parentOf'];
        if (hasParent && hasParent[0] === 'group:default/team-b') {
          return { items: [groupParentMock] };
        }
        return { items: [] };
      });

      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-c',
      );
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/team-a
    //
    //     Hierarchy:
    //
    // group:default/team-a  group:default/team-b
    //       |                        |
    // group:default/team-c  group:default/team-d
    //                |              |
    //                user:default/mike
    //
    it('should return true for hasLink, when user:default/mike inherits group tree with group:default/team-a', async () => {
      const groupCMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-c',
          namespace: 'default',
        },
        spec: {
          parent: 'group:default/team-a',
        },
      };
      const groupDMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-d',
          namespace: 'default',
        },
        spec: {
          parent: 'group:default/team-b',
        },
      };

      const groupAMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-a',
          namespace: 'default',
        },
      };
      const groupBMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-b',
          namespace: 'default',
        },
      };

      catalogApi.getEntities.mockImplementation((arg: any) => {
        const hasMember = arg.filter['relations.hasMember'];
        if (hasMember && hasMember[0] === 'user:default/mike') {
          return { items: [groupCMock, groupDMock] };
        }
        const hasParent = arg.filter['relations.parentOf'];
        if (
          hasParent &&
          hasParent[0] === 'group:default/team-c' &&
          hasParent[1] === 'group:default/team-d'
        ) {
          return { items: [groupAMock, groupBMock] };
        }
        return { items: [] };
      });

      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-a',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should inherits from group:default/team-e
    //
    //     Hierarchy:
    //
    // group:default/team-a  group:default/team-b
    //       |                        |
    // group:default/team-c  group:default/team-d
    //                |              |
    //                user:default/mike
    //
    it('should return true for hasLink, when user:default/mike inherits from group:default/team-e', async () => {
      const groupCMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-c',
          namespace: 'default',
        },
        spec: {
          parent: 'group:default/team-a',
        },
      };
      const groupDMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-d',
          namespace: 'default',
        },
        spec: {
          parent: 'group:default/team-b',
        },
      };

      const groupAMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-a',
          namespace: 'default',
        },
      };
      const groupBMock: Entity = {
        apiVersion: 'v1',
        kind: 'Group',
        metadata: {
          name: 'team-b',
          namespace: 'default',
        },
      };

      catalogApi.getEntities.mockImplementation((arg: any) => {
        const hasMember = arg.filter['relations.hasMember'];
        if (hasMember && hasMember[0] === 'user:default/mike') {
          return { items: [groupCMock, groupDMock] };
        }
        const hasParent = arg.filter['relations.parentOf'];
        if (
          hasParent &&
          hasParent[0] === 'group:default/team-c' &&
          hasParent[1] === 'group:default/team-d'
        ) {
          return { items: [groupAMock, groupBMock] };
        }
        return { items: [] };
      });

      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-e',
      );
      expect(result).toBeFalsy();
    });

    it('should throw an error for unsupported domain', async () => {
      await expect(
        roleManager.hasLink(
          'user:default/mike',
          'group:default/somegroup',
          'someDomain',
        ),
      ).rejects.toThrow('domain argument is not supported.');
    });
  });
});
