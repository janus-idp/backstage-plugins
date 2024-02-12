import {
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { SonataFlowService } from '../SonataFlowService';
import { mapToWorkflowOverviewDTO } from './mapping/V2Mappings';
import {
  generateTestWorkflowOverview,
  generateTestWorkflowOverviewList,
} from './test-utils';
import { V2 } from './v2';

jest.mock('../SonataFlowService', () => ({
  SonataFlowService: jest.fn(),
}));

jest.mock('../DataIndexService', () => ({
  getWorkflowDefinitions: jest.fn(),
}));

// Helper function to create a mock SonataFlowService instance
const createMockSonataFlowService = (): SonataFlowService => {
  const mockSonataFlowService = new SonataFlowService(
    {} as any, // Mock config
    {} as any, // Mock dataIndexService
    {} as any, // Mock logger
  );

  // Mock fetchWorkflowDefinition method
  mockSonataFlowService.fetchWorkflowOverviews = jest.fn();
  mockSonataFlowService.fetchWorkflowOverview = jest.fn();

  return mockSonataFlowService;
};

describe('getWorkflowOverview', () => {
  let mockSonataFlowService: SonataFlowService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSonataFlowService = createMockSonataFlowService();
  });

  it('0 items in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = {
      items: [],
    };

    (
      mockSonataFlowService.fetchWorkflowOverviews as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);

    // Act
    const result: WorkflowOverviewListResultDTO = await V2.getWorkflowsOverview(
      mockSonataFlowService,
    );

    // Assert
    expect(result).toEqual({
      overviews: mockOverviewsV1.items.map(item =>
        mapToWorkflowOverviewDTO(item),
      ),
      paginationInfo: {
        limit: 0,
        offset: 0,
        totalCount: mockOverviewsV1.items.length,
      },
    });
  });

  it('1 item in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = generateTestWorkflowOverviewList(1, {});

    (
      mockSonataFlowService.fetchWorkflowOverviews as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);

    // Act
    const result: WorkflowOverviewListResultDTO = await V2.getWorkflowsOverview(
      mockSonataFlowService,
    );

    // Assert
    expect(result).toEqual({
      overviews: mockOverviewsV1.items.map(item =>
        mapToWorkflowOverviewDTO(item),
      ),
      paginationInfo: {
        limit: 0,
        offset: 0,
        totalCount: mockOverviewsV1.items.length,
      },
    });
  });

  it('many items in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = generateTestWorkflowOverviewList(100, {});

    (
      mockSonataFlowService.fetchWorkflowOverviews as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);

    // Act
    const result: WorkflowOverviewListResultDTO = await V2.getWorkflowsOverview(
      mockSonataFlowService,
    );

    // Assert
    expect(result).toEqual({
      overviews: mockOverviewsV1.items.map(item =>
        mapToWorkflowOverviewDTO(item),
      ),
      paginationInfo: {
        limit: 0,
        offset: 0,
        totalCount: mockOverviewsV1.items.length,
      },
    });
  });

  it('undefined workflow overview list', async () => {
    // Arrange
    (
      mockSonataFlowService.fetchWorkflowOverviews as jest.Mock
    ).mockRejectedValue(new Error('no workflow overview'));

    // Act
    const promise = V2.getWorkflowsOverview(mockSonataFlowService);

    // Assert
    await expect(promise).rejects.toThrow('no workflow overview');
    (
      mockSonataFlowService.fetchWorkflowOverviews as jest.Mock
    ).mockRejectedValue(new Error('no workflow overview'));
  });
});
describe('getWorkflowOverviewById', () => {
  let mockSonataFlowService: SonataFlowService;
  beforeEach(() => {
    jest.clearAllMocks();
    mockSonataFlowService = createMockSonataFlowService();
  });

  it('0 items in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = {
      items: [],
    };
    (
      mockSonataFlowService.fetchWorkflowOverview as jest.Mock
    ).mockResolvedValue(mockOverviewsV1.items);
    // Act
    const overviewV2 = await V2.getWorkflowOverviewById(
      mockSonataFlowService,
      'test_workflowId',
    );

    // Assert
    expect(overviewV2).toBeDefined();
    expect(overviewV2.workflowId).toBeUndefined();
    expect(overviewV2.name).toBeUndefined();
    expect(overviewV2.uri).toBeUndefined();
    expect(overviewV2.lastTriggeredMs).toBeUndefined();
    expect(overviewV2.lastRunStatus).toBeUndefined();
    expect(overviewV2.category).toEqual('infrastructure');
    expect(overviewV2.avgDurationMs).toBeUndefined();
    expect(overviewV2.description).toBeUndefined();
  });

  it('1 item in workflow overview list', async () => {
    // Arrange
    const mockOverviewsV1 = generateTestWorkflowOverview({
      name: 'test_workflowId',
    });

    (
      mockSonataFlowService.fetchWorkflowOverview as jest.Mock
    ).mockResolvedValue(mockOverviewsV1);

    // Act
    const result: WorkflowOverviewDTO = await V2.getWorkflowOverviewById(
      mockSonataFlowService,
      'test_workflowId',
    );

    // Assert
    expect(result).toEqual(mapToWorkflowOverviewDTO(mockOverviewsV1));
  });
});
