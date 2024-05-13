import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

import { WorkflowExecutionResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  OrchestratorClient,
  OrchestratorClientOptions,
} from './OrchestratorClient';

describe('OrchestratorClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let orchestratorClientOptions: jest.Mocked<OrchestratorClientOptions>;
  let orchestratorClient: OrchestratorClient;
  const baseUrl = 'https://api.example.com';

  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch; // Cast global to any to avoid TypeScript errors

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock DiscoveryApi with a mocked implementation of getBaseUrl
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
    } as jest.Mocked<DiscoveryApi>;

    // Create OrchestratorClientOptions with the mocked DiscoveryApi
    orchestratorClientOptions = {
      discoveryApi: mockDiscoveryApi,
    };
    orchestratorClient = new OrchestratorClient(orchestratorClientOptions);
  });
  describe('executeWorkflow', () => {
    it('should execute workflow with empty parameters', async () => {
      // Given
      const workflowId = 'workflow123';
      const executionId = 'execId001';
      const parameters: JsonObject = {};
      const args = {
        workflowId: workflowId,
        parameters: {} as JsonObject,
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: executionId,
        }),
      });

      // When
      const result: WorkflowExecutionResponse =
        await orchestratorClient.executeWorkflow(args);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/execute`,
        {
          method: 'POST',
          body: JSON.stringify(parameters),
          headers: { 'content-type': 'application/json' },
        },
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toEqual(executionId);
    });
    it('should execute workflow with business key', async () => {
      // Given
      const workflowId = 'workflow123';
      const businessKey = 'business123';
      const executionId = 'execId001';
      const parameters: JsonObject = {};
      const args = {
        workflowId: workflowId,
        parameters: {} as JsonObject,
        businessKey: businessKey,
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: executionId,
        }),
      });

      // When
      const client = new OrchestratorClient(orchestratorClientOptions);
      const result: WorkflowExecutionResponse =
        await client.executeWorkflow(args);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/execute?businessKey=${businessKey}`,
        {
          method: 'POST',
          body: JSON.stringify(parameters),
          headers: { 'content-type': 'application/json' },
        },
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toEqual(executionId);
    });
    it('should execute workflow with parameters and business key', async () => {
      // Given
      const workflowId = 'workflow123';
      const businessKey = 'business123';
      const executionId = 'execId001';
      const parameters: JsonObject = {
        param1: 'one',
        param2: 2,
        param3: true,
      };
      const args = {
        workflowId: workflowId,
        parameters: parameters,
        businessKey: businessKey,
      };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: executionId,
        }),
      });

      // When
      const client = new OrchestratorClient(orchestratorClientOptions);
      const result: WorkflowExecutionResponse =
        await client.executeWorkflow(args);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/${workflowId}/execute?businessKey=${businessKey}`,
        {
          method: 'POST',
          body: JSON.stringify(parameters),
          headers: { 'content-type': 'application/json' },
        },
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toEqual(executionId);
    });
  });
  describe('abortWorkflow', () => {
    it('should abort a workflow instance successfully', async () => {
      // Given
      const instanceId = 'instance123';

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // When
      await orchestratorClient.abortWorkflowInstance(instanceId);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/instances/${instanceId}/abort`,
        {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    it('should throw a ResponseError if aborting the workflow instance fails', async () => {
      // Given
      const instanceId = 'instance123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When
      const promise = orchestratorClient.abortWorkflowInstance(instanceId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getWorkflowDefinition', () => {
    it('should return a workflow definition when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const mockWorkflowDefinition = { id: workflowId, name: 'Workflow 1' };

      // Mock fetch to simulate a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockWorkflowDefinition),
      });

      // When
      const result = await orchestratorClient.getWorkflowDefinition(workflowId);

      // Then
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/workflows/${workflowId}`);
      expect(result).toEqual(mockWorkflowDefinition);
    });

    it('should throw a ResponseError when fetching the workflow definition fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Mock fetch to simulate a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // When
      const promise = orchestratorClient.getWorkflowDefinition(workflowId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
});
