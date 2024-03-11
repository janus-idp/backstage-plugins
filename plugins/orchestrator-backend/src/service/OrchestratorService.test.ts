import {
  ProcessInstance,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from './DataIndexService';
import { OrchestratorService } from './OrchestratorService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowCacheService } from './WorkflowCacheService';

// Mocked data helpers
const createInstanceIdMock = (x: number): string => `instance${x}`;
const createDefinitionIdMock = (x: number): string => `definition${x}`;
const createWorkflowInfoMock = (x: number): WorkflowInfo => {
  return {
    id: createDefinitionIdMock(x),
  };
};
const createWorkflowOverviewMock = (x: number): WorkflowOverview => {
  return {
    workflowId: createDefinitionIdMock(x),
    format: 'yaml',
  };
};
const createInstanceMock = (x: number): ProcessInstance => {
  return {
    id: createInstanceIdMock(x),
    processId: createDefinitionIdMock(x),
    endpoint: `endpoint${x}`,
    nodes: [],
  };
};

// Mocked data
const instanceId = createInstanceIdMock(1);
const definitionId = createDefinitionIdMock(1);
const workflowInfo = createWorkflowInfoMock(1);
const workflowOverview = createWorkflowOverviewMock(1);
const instance = createInstanceMock(1);

// Mocked dependencies
const sonataFlowServiceMock = {} as SonataFlowService;
const workflowCacheServiceMock = {} as WorkflowCacheService;
const dataIndexServiceMock = {} as DataIndexService;

// Target service
const orchestratorService = new OrchestratorService(
  sonataFlowServiceMock,
  dataIndexServiceMock,
  workflowCacheServiceMock,
);

describe('OrchestratorService', () => {
  describe('abortWorkflowInstance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      dataIndexServiceMock.fetchDefinitionIdByInstanceId = jest
        .fn()
        .mockResolvedValue(definitionId);
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      dataIndexServiceMock.abortWorkflowInstance = jest.fn(
        (_instanceId: string) => Promise.resolve(),
      );

      await orchestratorService.abortWorkflowInstance({
        instanceId,
        cacheHandler: 'skip',
      });

      expect(
        dataIndexServiceMock.fetchDefinitionIdByInstanceId,
      ).toHaveBeenCalledWith(instanceId);
      expect(dataIndexServiceMock.abortWorkflowInstance).toHaveBeenCalledWith(
        instanceId,
      );
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      dataIndexServiceMock.fetchDefinitionIdByInstanceId = jest
        .fn()
        .mockResolvedValue(definitionId);
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      await orchestratorService.abortWorkflowInstance({
        instanceId,
        cacheHandler: 'skip',
      });

      expect(
        dataIndexServiceMock.fetchDefinitionIdByInstanceId,
      ).toHaveBeenCalledWith(instanceId);
      expect(dataIndexServiceMock.abortWorkflowInstance).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      dataIndexServiceMock.fetchDefinitionIdByInstanceId = jest
        .fn()
        .mockResolvedValue(definitionId);
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.abortWorkflowInstance({
        instanceId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(
        dataIndexServiceMock.fetchDefinitionIdByInstanceId,
      ).toHaveBeenCalledWith(instanceId);
      expect(workflowCacheServiceMock.isAvailable).toHaveBeenCalledWith(
        definitionId,
        'throw',
      );
      expect(dataIndexServiceMock.abortWorkflowInstance).not.toHaveBeenCalled();
    });
  });

  describe('fetchWorkflowInfo', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      dataIndexServiceMock.fetchWorkflowInfo = jest
        .fn()
        .mockResolvedValue(workflowInfo);

      const result = await orchestratorService.fetchWorkflowInfo({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.fetchWorkflowInfo({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(dataIndexServiceMock.fetchWorkflowInfo).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.fetchWorkflowInfo({
        definitionId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(dataIndexServiceMock.fetchWorkflowInfo).not.toHaveBeenCalled();
    });
  });

  describe('fetchWorkflowSource', () => {
    const workflowSource = 'workflow source';
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      dataIndexServiceMock.fetchWorkflowSource = jest
        .fn()
        .mockResolvedValue(workflowSource);

      const result = await orchestratorService.fetchWorkflowSource({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.fetchWorkflowSource({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(dataIndexServiceMock.fetchWorkflowSource).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.fetchWorkflowSource({
        definitionId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(dataIndexServiceMock.fetchWorkflowSource).not.toHaveBeenCalled();
    });
  });

  describe('fetchInstanceVariables', () => {
    const variables: ProcessInstanceVariables = { foo: 'bar' };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      dataIndexServiceMock.fetchDefinitionIdByInstanceId = jest
        .fn()
        .mockResolvedValue(definitionId);
      dataIndexServiceMock.fetchInstanceVariables = jest
        .fn()
        .mockResolvedValue(variables);

      const result = await orchestratorService.fetchInstanceVariables({
        instanceId,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);
      dataIndexServiceMock.fetchDefinitionIdByInstanceId = jest
        .fn()
        .mockResolvedValue(definitionId);

      const result = await orchestratorService.fetchInstanceVariables({
        instanceId,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(
        dataIndexServiceMock.fetchInstanceVariables,
      ).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });
      dataIndexServiceMock.fetchDefinitionIdByInstanceId = jest
        .fn()
        .mockResolvedValue(definitionId);

      const promise = orchestratorService.fetchInstanceVariables({
        instanceId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(
        dataIndexServiceMock.fetchInstanceVariables,
      ).not.toHaveBeenCalled();
    });
  });

  describe('fetchInstance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      dataIndexServiceMock.fetchInstance = jest
        .fn()
        .mockResolvedValue(instance);

      const result = await orchestratorService.fetchInstance({
        instanceId,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.fetchInstance({
        instanceId,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.fetchInstance({
        instanceId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();
    });
  });

  describe('fetchWorkflowInfoOnService', () => {
    const serviceUrl = 'http://localhost';
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      sonataFlowServiceMock.fetchWorkflowInfoOnService = jest
        .fn()
        .mockResolvedValue(workflowInfo);

      const result = await orchestratorService.fetchWorkflowInfoOnService({
        definitionId,
        serviceUrl,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.fetchWorkflowInfoOnService({
        definitionId,
        serviceUrl,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(
        sonataFlowServiceMock.fetchWorkflowInfoOnService,
      ).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.fetchWorkflowInfoOnService({
        definitionId,
        serviceUrl,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(
        sonataFlowServiceMock.fetchWorkflowInfoOnService,
      ).not.toHaveBeenCalled();
    });
  });

  describe('fetchWorkflowDefinition', () => {
    const definition: WorkflowDefinition = {
      id: 'test_workflowId',
      specVersion: '0.8',
      states: [{}],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      sonataFlowServiceMock.fetchWorkflowDefinition = jest
        .fn()
        .mockResolvedValue(definition);

      const result = await orchestratorService.fetchWorkflowDefinition({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.fetchWorkflowDefinition({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(
        sonataFlowServiceMock.fetchWorkflowDefinition,
      ).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.fetchWorkflowDefinition({
        definitionId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(
        sonataFlowServiceMock.fetchWorkflowDefinition,
      ).not.toHaveBeenCalled();
    });
  });

  describe('fetchWorkflowOverview', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      sonataFlowServiceMock.fetchWorkflowOverview = jest
        .fn()
        .mockResolvedValue(workflowOverview);

      const result = await orchestratorService.fetchWorkflowOverview({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.fetchWorkflowOverview({
        definitionId,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(
        sonataFlowServiceMock.fetchWorkflowOverview,
      ).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.fetchWorkflowOverview({
        definitionId,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(
        sonataFlowServiceMock.fetchWorkflowOverview,
      ).not.toHaveBeenCalled();
    });
  });

  describe('executeWorkflow', () => {
    const serviceUrl = 'http://localhost';
    const inputData = {};
    const executeResponse: WorkflowExecutionResponse = {
      id: createInstanceIdMock(1),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should execute the operation when the workflow is available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(true);
      sonataFlowServiceMock.executeWorkflow = jest
        .fn()
        .mockResolvedValue(executeResponse);

      const result = await orchestratorService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
        cacheHandler: 'skip',
      });

      expect(result).toBeDefined();
    });

    it('should skip and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest.fn().mockReturnValue(false);

      const result = await orchestratorService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
        cacheHandler: 'skip',
      });

      expect(result).toBeUndefined();
      expect(sonataFlowServiceMock.executeWorkflow).not.toHaveBeenCalled();
    });

    it('should throw an error and not execute the operation when the workflow is not available', async () => {
      workflowCacheServiceMock.isAvailable = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      const promise = orchestratorService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
        cacheHandler: 'throw',
      });

      await expect(promise).rejects.toThrow();

      expect(sonataFlowServiceMock.executeWorkflow).not.toHaveBeenCalled();
    });
  });
});
