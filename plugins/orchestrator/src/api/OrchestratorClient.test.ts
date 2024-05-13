import { DiscoveryApi } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { WorkflowExecutionResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  OrchestratorClient,
  OrchestratorClientOptions,
} from './OrchestratorClient';

describe('OrchestratorClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let orchestratorClientOptions: jest.Mocked<OrchestratorClientOptions>;

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
  });
  it('should execute workflow with empty parameters', async () => {
    // Given
    const baseUrl = 'https://api.example.com';
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
    const client = new OrchestratorClient(orchestratorClientOptions);
    const result: WorkflowExecutionResponse =
      await client.executeWorkflow(args);

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
    const baseUrl = 'https://api.example.com';
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
    const baseUrl = 'https://api.example.com';
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
