import { LoggerService } from '@backstage/backend-plugin-api';

import { Client, OperationResult } from '@urql/core';

import {
  FieldFilterOperatorEnum,
  LogicalFilter,
  NodeInstance,
  ProcessInstance,
  TypeKind,
  TypeName,
  WorkflowInfo,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import * as graphqlUtils from '../helpers/queryBuilder';
import { Pagination } from '../types/pagination';
import {
  mockProcessDefinitionArguments,
  mockProcessDefinitionIntrospection,
} from './__fixtures__/mockProcessDefinitionArgumentsData';
import {
  mockProcessInstanceArguments,
  mockProcessInstanceIntrospection,
} from './__fixtures__/mockProcessInstanceArgumentsData';
import { DataIndexService } from './DataIndexService';

jest.mock('../helpers/queryBuilder', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../helpers/queryBuilder'),
  };
});

jest.mock('@urql/core', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
    })),
  };
});

const mockOperationResult = <T>(data: T, error?: any): OperationResult<T> => ({
  data,
  error,
  operation: {} as any,
  extensions: {},
  hasNext: false,
  stale: false,
});

const mockWfInfos: WorkflowInfo[] = [
  {
    id: '9fa2a881-c932-468d-83a9-687b9f1e62a7',
    nodes: [createNodeObject('A'), createNodeObject('B')],
  },
];

const createQueryArgs = (
  type: 'ProcessDefinitions' | 'ProcessInstances' | 'Jobs',
  queryBody: string,
  whereClause?: string,
  pagination?: Pagination,
) => ({
  type,
  queryBody,
  whereClause,
  pagination,
});

describe('initInputArgs', () => {
  type MockableClient = Pick<Client, 'query'>;
  const createMockClient = (): jest.Mocked<MockableClient> => ({
    query: jest.fn(),
  });

  let loggerMock: LoggerService;
  let dataIndexService: DataIndexService;
  let mockClient: jest.Mocked<MockableClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    // Create a new mock client for each test
    mockClient = createMockClient();
    (Client as jest.MockedClass<typeof Client>).mockImplementation(
      () => mockClient as unknown as Client,
    );

    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockProcessDefinitionArguments),
    );
    dataIndexService = new DataIndexService('fakeUrl', loggerMock);
  });

  it('ProcessDefinition', async () => {
    const processDefinitionArguments =
      await dataIndexService.initInputProcessDefinitionArgs();

    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      dataIndexService.graphQLArgumentQuery('ProcessDefinition'),
      {},
    );

    expect(processDefinitionArguments).toBeDefined();
    expect(
      processDefinitionArguments.every(
        val => !['and', 'or', 'not'].includes(val.name),
      ),
    ).toBe(true);
    expect(processDefinitionArguments).toHaveLength(3);
    expect(
      processDefinitionArguments.some(
        obj =>
          obj.name === 'id' &&
          obj.type.kind === TypeKind.InputObject &&
          obj.type.name === TypeName.String,
      ),
    ).toBe(true);
    expect(
      processDefinitionArguments.some(
        obj =>
          obj.name === 'name' &&
          obj.type.kind === TypeKind.InputObject &&
          obj.type.name === TypeName.String,
      ),
    ).toBe(true);
    expect(
      processDefinitionArguments.some(
        obj =>
          obj.name === 'version' &&
          obj.type.kind === TypeKind.InputObject &&
          obj.type.name === TypeName.String,
      ),
    ).toBe(true);
  });
});

describe('fetchWorkflowInfos', () => {
  let loggerMock: LoggerService;
  let buildFilterConditionSpy: any;
  let buildGraphQlQuerySpy: jest.SpyInstance;
  let dataIndexService: DataIndexService;
  let mockClient: jest.Mocked<Client>;

  const definitionIds = ['id1', 'id2'];
  const queryBody = 'id, name, version, type, endpoint, serviceUrl, source';
  const pagination = { limit: 10, offset: 0, order: 'ASC', sortField: 'name' };

  const filterString =
    'or: {name: {equal: "Hello World Workflow"}, id: {equal: "yamlgreet"}}';

  const helloWorldFilter = {
    field: 'name',
    operator: FieldFilterOperatorEnum.Eq,
    value: 'Hello World Workflow',
  };
  const greetingFilter = {
    field: 'id',
    operator: FieldFilterOperatorEnum.Eq,
    value: 'yamlgreet',
  };

  const logicalFilter: LogicalFilter = {
    operator: 'OR',
    filters: [helloWorldFilter, greetingFilter],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      query: jest.fn(),
    } as any;

    (Client as jest.Mock).mockImplementation(() => mockClient);

    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    };

    dataIndexService = new DataIndexService('fakeUrl', loggerMock);

    // Set up spies on the graphql utility functions
    buildGraphQlQuerySpy = jest.spyOn(graphqlUtils, 'buildGraphQlQuery');
    buildFilterConditionSpy = jest.spyOn(graphqlUtils, 'buildFilterCondition');
  });
  it('should fetch workflow infos with no parameters', async () => {
    // Given
    const mockQueryResult = {
      ProcessDefinitions: mockWfInfos,
    };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs('ProcessDefinitions', queryBody);
    // When
    const result = await dataIndexService.fetchWorkflowInfos({});
    // Then
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
    expect(buildFilterConditionSpy).not.toHaveBeenCalled();
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
    });
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
  });

  it('should fetch workflow infos with definitionIds', async () => {
    // Given
    const whereClause = `id: {in: ${JSON.stringify(definitionIds)}}`;
    const mockQueryResult = {
      ProcessDefinitions: mockWfInfos,
    };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
    });

    // Then
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).not.toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
  });

  it('should fetch workflow infos with definitionIds and pagination', async () => {
    // Given
    const mockQueryResult = {
      ProcessDefinitions: mockWfInfos,
    };
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      `id: {in: ${JSON.stringify(definitionIds)}}`,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
      pagination,
    });

    // Then
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause: `id: {in: ${JSON.stringify(definitionIds)}}`,
      pagination,
    });
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(buildFilterConditionSpy).not.toHaveBeenCalled();
  });

  it('should fetch workflow infos with only filter', async () => {
    // Given
    const mockQueryResult = {
      ProcessDefinitions: mockWfInfos,
    };
    mockClient.query
      .mockResolvedValueOnce(
        mockOperationResult(mockProcessDefinitionArguments),
      )
      .mockResolvedValueOnce(mockOperationResult(mockQueryResult));

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      filterString,
    );

    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      filter: logicalFilter,
    });

    // Then
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);

    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause: filterString,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(
      mockProcessDefinitionIntrospection,
      logicalFilter,
    );
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
  });

  it('should fetch workflow infos with definitionIds and filter', async () => {
    // Given
    const whereClause = `and: [{id: {in: ${JSON.stringify(definitionIds)}}}, {${filterString}}]`;
    // Given
    const mockQueryResult = {
      ProcessDefinitions: mockWfInfos,
    };
    mockClient.query
      .mockResolvedValueOnce(
        mockOperationResult(mockProcessDefinitionArguments),
      )
      .mockResolvedValueOnce(mockOperationResult(mockQueryResult));

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      whereClause,
    );

    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
      filter: logicalFilter,
    });

    // Then

    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody: 'id, name, version, type, endpoint, serviceUrl, source',
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(
      mockProcessDefinitionIntrospection,
      logicalFilter,
    );
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });

  it('should fetch workflow infos with definitionIds, pagination, and filter', async () => {
    // Given
    const whereClause = `and: [{id: {in: ${JSON.stringify(definitionIds)}}}, {${filterString}}]`;
    // Given
    const mockQueryResult = {
      ProcessDefinitions: mockWfInfos,
    };
    mockClient.query
      .mockResolvedValueOnce(
        mockOperationResult(mockProcessDefinitionArguments),
      )
      .mockResolvedValueOnce(mockOperationResult(mockQueryResult));

    const expectedQueryArgs = createQueryArgs(
      'ProcessDefinitions',
      queryBody,
      whereClause,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchWorkflowInfos({
      definitionIds,
      pagination,
      filter: logicalFilter,
    });

    // Then

    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(2);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessDefinitions',
      queryBody,
      whereClause,
      pagination,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(
      mockProcessDefinitionIntrospection,
      logicalFilter,
    );
    expect(result).toBeDefined();
    expect(result).toBe(mockQueryResult.ProcessDefinitions);
  });
});
describe('fetchInstances', () => {
  let loggerMock: LoggerService;
  let buildFilterConditionSpy: any;
  let buildGraphQlQuerySpy: any;
  let mockClient: jest.Mocked<Client>;

  let dataIndexService: DataIndexService;

  const definitionIds = ['id', 'name'];
  const pagination = { limit: 10, offset: 0, order: 'ASC', sortField: 'name' };

  const processIdNotNullCondition = 'processId: {isNull: false}';
  const processIdDefinitions = `processId: {in: ${JSON.stringify(definitionIds)}`;
  const queryBody =
    'id, processName, processId, businessKey, state, start, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}';

  const mockProcessInstances: ProcessInstance[] = [
    {
      id: 'id',
      processId: 'processId1',
      endpoint: 'endpoint1',
      nodes: [createNodeObject('A'), createNodeObject('B')],
    },
    {
      id: 'name',
      processId: 'processId2',
      endpoint: 'endpoint2',
      nodes: [createNodeObject('C'), createNodeObject('D')],
    },
  ];

  const filterString =
    'or: {processId: {equal: "processId1"}, processName: {like: "processName%"}}';

  const procName1Filter = {
    field: 'processName',
    operator: FieldFilterOperatorEnum.Like,
    value: 'processName%',
  };
  const procId1Filter = {
    field: 'processId',
    operator: FieldFilterOperatorEnum.Eq,
    value: 'processId1',
  };

  const logicalFilter: LogicalFilter = {
    operator: 'OR',
    filters: [procId1Filter, procName1Filter],
  };
  const mockQueryResult = { ProcessInstances: mockProcessInstances };

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
    } as any;

    (Client as jest.Mock).mockImplementation(() => mockClient);

    const wfInfo: WorkflowInfo = {
      id: 'wfinfo1',
      source: 'workflow info source',
    };

    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    };
    dataIndexService = new DataIndexService('fakeUrl', loggerMock);
    // Create a spy for method1
    jest.spyOn(dataIndexService, 'fetchWorkflowInfo').mockResolvedValue(wfInfo);
    // Set up spies on the graphql utility functions
    buildGraphQlQuerySpy = jest.spyOn(graphqlUtils, 'buildGraphQlQuery');
    buildFilterConditionSpy = jest.spyOn(graphqlUtils, 'buildFilterCondition');

    // Clear mocks before each test
    jest.clearAllMocks();
  });
  it('should fetch instances with no parameters', async () => {
    // Given
    const whereClause = processIdNotNullCondition;
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );

    // When
    const result = await dataIndexService.fetchInstances({});

    // Then
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);

    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).not.toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
  });

  it('should fetch instances with definitionIds', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}]`;

    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
      pagination: undefined,
    });
    expect(buildFilterConditionSpy).not.toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with definitionIds and pagination', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}]`;
    mockClient.query.mockResolvedValueOnce(
      mockOperationResult(mockQueryResult),
    );

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,

      pagination,
    });

    // Then
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);

    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    });
    expect(buildFilterConditionSpy).not.toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
  });

  it('should fetch instances with only filter', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${filterString}}]`;
    mockClient.query
      .mockResolvedValueOnce(mockOperationResult(mockProcessInstanceArguments))
      .mockResolvedValueOnce(mockOperationResult(mockQueryResult));

    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      filter: logicalFilter,
    });

    // Then
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(
      mockProcessInstanceIntrospection,
      logicalFilter,
    );
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
  });

  it('should fetch instances with definitionIds and filter', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}, {${filterString}}]`;
    mockClient.query
      .mockResolvedValueOnce(mockOperationResult(mockProcessInstanceArguments))
      .mockResolvedValueOnce(mockOperationResult(mockQueryResult));
    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,
      filter: logicalFilter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(
      mockProcessInstanceIntrospection,
      logicalFilter,
    );
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });

  it('should fetch instances with definitionIds, pagination, and filter', async () => {
    // Given
    const whereClause = `and: [{${processIdNotNullCondition}}, {${processIdDefinitions}}}, {${filterString}}]`;
    mockClient.query
      .mockResolvedValueOnce(mockOperationResult(mockProcessInstanceArguments))
      .mockResolvedValueOnce(mockOperationResult(mockQueryResult));
    const expectedQueryArgs = createQueryArgs(
      'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    );
    // When
    const result = await dataIndexService.fetchInstances({
      definitionIds,
      pagination,
      filter: logicalFilter,
    });

    // Then
    expect(buildGraphQlQuerySpy).toHaveBeenCalledTimes(1);
    expect(buildGraphQlQuerySpy).toHaveBeenCalledWith({
      type: 'ProcessInstances',
      queryBody,
      whereClause,
      pagination,
    });
    expect(buildFilterConditionSpy).toHaveBeenCalledTimes(1);
    expect(buildFilterConditionSpy).toHaveBeenCalledWith(
      mockProcessInstanceIntrospection,
      logicalFilter,
    );
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenCalledWith(
      graphqlUtils.buildGraphQlQuery(expectedQueryArgs),
      {},
    );
    expect(result).toBeDefined();
    expect(result).toStrictEqual(mockQueryResult.ProcessInstances);
  });
});

function createNodeObject(suffix: string): NodeInstance {
  return {
    id: `node${suffix}`,
    name: `node${suffix}`,
    enter: new Date('2024-08-01T14:30:00').toISOString(),
    type: 'NodeType',
    definitionId: `definitionId${suffix}`,
    nodeId: `nodeId${suffix}`,
  };
}
