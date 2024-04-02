import { Entity } from '@backstage/catalog-model';

import * as Knex from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';

import { AncestorSearchMemo, Relation } from './ancestor-search-memo';

describe('ancestor-search-memo', () => {
  const userRelations = [
    {
      source_entity_ref: 'user:default/adam',
      target_entity_ref: 'group:default/team-a',
    },
  ];

  const allRelations = [
    {
      source_entity_ref: 'user:default/adam',
      target_entity_ref: 'group:default/team-a',
    },
    {
      source_entity_ref: 'group:default/team-a',
      target_entity_ref: 'group:default/team-b',
    },
    {
      source_entity_ref: 'group:default/team-b',
      target_entity_ref: 'group:default/team-c',
    },
    {
      source_entity_ref: 'user:default/george',
      target_entity_ref: 'group:default/team-d',
    },
    {
      source_entity_ref: 'group:default/team-d',
      target_entity_ref: 'group:default/team-e',
    },
    {
      source_entity_ref: 'group:default/team-e',
      target_entity_ref: 'group:default/team-f',
    },
  ];

  const testGroups = [
    createGroupEntity(
      'group:default/team-a',
      'group:default/team-b',
      [],
      ['adam'],
    ),
    createGroupEntity('group:default/team-b', 'group:default/team-c', [], []),
    createGroupEntity('group:default/team-c', '', [], []),
    createGroupEntity(
      'group:default/team-d',
      'group:default/team-e',
      [],
      ['george'],
    ),
    createGroupEntity('group:default/team-e', 'group:default/team-f', [], []),
    createGroupEntity('group:default/team-f', '', [], []),
  ];

  const catalogApiMock: any = {
    getEntities: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ items: testGroups })),
  };

  const catalogDBClient = Knex.knex({ client: MockClient });

  const tokenManagerMock = {
    getToken: jest.fn().mockImplementation(async () => {
      return Promise.resolve({ token: 'some-token' });
    }),
    authenticate: jest.fn().mockImplementation(),
  };

  const asm = new AncestorSearchMemo(
    'user:default/adam',
    tokenManagerMock,
    catalogApiMock,
    catalogDBClient,
  );

  describe('getAllGroups and getAllRelations', () => {
    let tracker: Tracker;

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should return all relations', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asm.getAllRelations();
      expect(allRelationsTest).toEqual(allRelations);
    });

    it('should return all groups', async () => {
      const allGroupsTest = await asm.getAllGroups();
      // @ts-ignore
      expect(allGroupsTest).toEqual(testGroups);
    });

    it('should fail to return anything when there is an error getting all relations', async () => {
      const allRelationsTest = await asm.getAllRelations();
      expect(allRelationsTest).toEqual([]);
    });
  });

  describe('getUserGroups and getUserRelations', () => {
    let tracker: Tracker;

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should return all user relations', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const relations = await asm.getUserRelations();

      expect(relations).toEqual(userRelations);
    });

    it('should return all user groups', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const relations = await asm.getUserRelations();

      expect(relations).toEqual(userRelations);
    });

    it('should fail to return anything when there is an error getting user relations', async () => {
      const relations = await asm.getUserRelations();

      expect(relations).toEqual([]);
    });
  });

  describe('traverseRelations', () => {
    let tracker: Tracker;

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build a graph for a particular user', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const userRelationsTest = await asm.getUserRelations();

      tracker.reset();
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asm.getAllRelations();

      userRelationsTest.forEach(relation =>
        asm.traverseRelations(
          asm,
          relation as Relation,
          allRelationsTest as Relation[],
        ),
      );

      expect(asm.hasEntityRef('user:default/adam')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-c')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-d')).toBeFalsy();
    });
  });

  describe('buildUserGraph', () => {
    let tracker: Tracker;

    const asmUserGraph = new AncestorSearchMemo(
      'user:default/adam',
      tokenManagerMock,
      catalogApiMock,
      catalogDBClient,
    );

    const asmDBSpy = jest
      .spyOn(asmUserGraph, 'doesRelationTableExist')
      .mockImplementation(() => Promise.resolve(true));

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build the user graph using relations table', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      tracker.reset();
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      await asmUserGraph.buildUserGraph(asmUserGraph);

      expect(asmDBSpy).toHaveBeenCalled();
      expect(asm.hasEntityRef('user:default/adam')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-c')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-d')).toBeFalsy();
    });
  });

  function createGroupEntity(
    name: string,
    parent?: string,
    children?: string[],
    members?: string[],
  ): Entity {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name,
        namespace: 'default',
      },
      spec: {},
    };

    if (children) {
      entity.spec!.children = children;
    }

    if (members) {
      entity.spec!.members = members;
    }

    if (parent) {
      entity.spec!.parent = parent;
    }

    return entity;
  }
});
