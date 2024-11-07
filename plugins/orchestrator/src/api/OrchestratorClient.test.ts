import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosResponseHeaders,
} from 'axios';

import {
  AssessedProcessInstanceDTO,
  DefaultApi,
  ExecuteWorkflowResponseDTO,
  PaginationInfoDTO,
  ProcessInstanceListResultDTO,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  WorkflowFormatDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  OrchestratorClient,
  OrchestratorClientOptions,
} from './OrchestratorClient';

jest.mock('axios');

describe('OrchestratorClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockIdentityApi: jest.Mocked<IdentityApi>;
  let orchestratorClientOptions: jest.Mocked<OrchestratorClientOptions>;
  let orchestratorClient: OrchestratorClient;
  const baseUrl = 'https://api.example.com';
  const mockToken = 'test-token';
  const defaultAuthHeaders = { Authorization: `Bearer ${mockToken}` };

  const mockFetch = jest.fn();
  (global as any).fetch = mockFetch; // Cast global to any to avoid TypeScript errors

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock DiscoveryApi with a mocked implementation of getBaseUrl
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
    } as jest.Mocked<DiscoveryApi>;
    mockIdentityApi = {
      getCredentials: jest.fn().mockResolvedValue({ token: mockToken }),
      getProfileInfo: jest
        .fn()
        .mockResolvedValue({ displayName: 'test', email: 'test@test' }),
      getBackstageIdentity: jest
        .fn()
        .mockResolvedValue({ userEntityRef: 'default/test' }),
      signOut: jest.fn().mockImplementation(),
    } as jest.Mocked<IdentityApi>;

    // Create OrchestratorClientOptions with the mocked DiscoveryApi
    orchestratorClientOptions = {
      discoveryApi: mockDiscoveryApi,
      identityApi: mockIdentityApi,
      axiosInstance: axios,
    };
    orchestratorClient = new OrchestratorClient(orchestratorClientOptions);
  });

  describe('executeWorkflow', () => {
    const workflowId = 'workflow123';

    const setupTest = (
      executionId: string,
      parameters: JsonObject,
      businessKey?: string,
    ) => {
      const mockExecResponse: ExecuteWorkflowResponseDTO = { id: executionId };
      const mockResponse: AxiosResponse<ExecuteWorkflowResponseDTO> = {
        data: mockExecResponse,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      const executeWorkflowSpy = jest.spyOn(
        DefaultApi.prototype,
        'executeWorkflow',
      );
      axios.request = jest.fn().mockResolvedValueOnce(mockResponse);

      const args = { workflowId, parameters, businessKey };

      return { mockExecResponse, executeWorkflowSpy, args };
    };

    const getExpectations = (
      result: any,
      mockExecResponse: ExecuteWorkflowResponseDTO,
      executeWorkflowSpy: jest.SpyInstance,
      parameters: JsonObject,
    ) => {
      return () => {
        expect(result).toBeDefined();
        expect(result.data).toEqual(mockExecResponse);
        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({
          ...getAxiosTestRequest(`/v2/workflows/${workflowId}/execute`),
          data: JSON.stringify({ inputData: parameters }),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...defaultAuthHeaders,
          },
        });
        expect(executeWorkflowSpy).toHaveBeenCalledTimes(1);
        expect(executeWorkflowSpy).toHaveBeenCalledWith(
          workflowId,
          { inputData: parameters },
          getDefaultTestRequestConfig(),
        );
      };
    };

    it('should execute workflow with empty parameters', async () => {
      // Given
      const { mockExecResponse, executeWorkflowSpy, args } = setupTest(
        'execId001',
        {},
      );

      // When
      const result = await orchestratorClient.executeWorkflow(args);

      // Then
      expect(
        getExpectations(result, mockExecResponse, executeWorkflowSpy, {}),
      ).not.toThrow();
    });
    it('should execute workflow with business key', async () => {
      // Given
      const { mockExecResponse, executeWorkflowSpy, args } = setupTest(
        'execId001',
        {},
        'business123',
      );

      const result = await orchestratorClient.executeWorkflow(args);

      expect(
        getExpectations(result, mockExecResponse, executeWorkflowSpy, {}),
      ).not.toThrow();
    });
    it('should execute workflow with parameters and business key', async () => {
      // Given
      const parameters = { param1: 'one', param2: 2, param3: true };
      const { mockExecResponse, executeWorkflowSpy, args } = setupTest(
        'execId001',
        parameters,
        'business123',
      );

      const result = await orchestratorClient.executeWorkflow(args);

      expect(
        getExpectations(
          result,
          mockExecResponse,
          executeWorkflowSpy,
          parameters,
        ),
      ).not.toThrow();
    });
  });
  describe('abortWorkflow', () => {
    it('should abort a workflow instance successfully', async () => {
      // Given
      const instanceId = 'instance123';

      const mockResponse: AxiosResponse<string> = {
        data: instanceId,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      const abortWorkflowSpy = jest.spyOn(
        DefaultApi.prototype,
        'abortWorkflow',
      );
      axios.request = jest.fn().mockResolvedValueOnce(mockResponse);
      // When
      const result = await orchestratorClient.abortWorkflowInstance(instanceId);

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(instanceId);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith({
        ...getAxiosTestRequest(`/v2/workflows/instances/${instanceId}/abort`),
        method: 'DELETE',
        headers: {
          ...defaultAuthHeaders,
        },
      });
      expect(abortWorkflowSpy).toHaveBeenCalledTimes(1);
      expect(abortWorkflowSpy).toHaveBeenCalledWith(
        instanceId,
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError if aborting the workflow instance fails', async () => {
      // Given
      const instanceId = 'instance123';

      // Mock fetch to simulate a failure
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
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
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/workflows/${workflowId}`, {
        headers: defaultAuthHeaders,
      });
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
  describe('getWorkflowSource', () => {
    it('should return workflow source when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const mockWorkflowSource = 'test workflow source';
      const responseConfigOptions = getDefaultTestRequestConfig();
      responseConfigOptions.responseType = 'text';
      const mockResponse: AxiosResponse<string> = {
        data: mockWorkflowSource,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };
      // Mock axios request to simulate a successful response
      jest.spyOn(axios, 'request').mockResolvedValueOnce(mockResponse);

      // Spy DefaultApi
      const getSourceSpy = jest.spyOn(
        DefaultApi.prototype,
        'getWorkflowSourceById',
      );

      // When
      const result = await orchestratorClient.getWorkflowSource(workflowId);

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockWorkflowSource);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith({
        ...getAxiosTestRequest(`/v2/workflows/${workflowId}/source`),
        method: 'GET',
        headers: {
          ...defaultAuthHeaders,
        },
        responseType: 'text',
      });
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith(
        workflowId,
        responseConfigOptions,
      );
    });

    it('should throw a ResponseError when fetching the workflow source fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Mock fetch to simulate a failure
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
      // When
      const promise = orchestratorClient.getWorkflowSource(workflowId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('listWorkflowOverviews', () => {
    it('should return workflow overviews when successful', async () => {
      // Given
      const paginationInfo: PaginationInfoDTO = {
        offset: 1,
        pageSize: 5,
        orderBy: 'name',
        orderDirection: 'ASC',
      };
      const mockWorkflowOverviews: WorkflowOverviewListResultDTO = {
        overviews: [
          {
            workflowId: 'workflow123',
            name: 'Workflow 1',
            format: WorkflowFormatDTO.Yaml,
          },
          {
            workflowId: 'workflow456',
            name: 'Workflow 2',
            format: WorkflowFormatDTO.Yaml,
          },
        ],
        paginationInfo: paginationInfo,
      };

      const mockResponse: AxiosResponse<WorkflowOverviewListResultDTO> = {
        data: mockWorkflowOverviews,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      // Spy DefaultApi
      const getWorkflowsOverviewSpy = jest.spyOn(
        DefaultApi.prototype,
        'getWorkflowsOverview',
      );

      // Mock axios request to simulate a successful response
      jest.spyOn(axios, 'request').mockResolvedValueOnce(mockResponse);

      // When
      const result =
        await orchestratorClient.listWorkflowOverviews(paginationInfo);

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockWorkflowOverviews);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith({
        ...getAxiosTestRequest('v2/workflows/overview'),
        data: JSON.stringify({ paginationInfo }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultAuthHeaders,
        },
      });
      expect(getWorkflowsOverviewSpy).toHaveBeenCalledTimes(1);
      expect(getWorkflowsOverviewSpy).toHaveBeenCalledWith(
        { paginationInfo },
        getDefaultTestRequestConfig(),
      );
    });
    it('should throw a ResponseError when listing workflow overviews fails', async () => {
      // Given

      // Mock fetch to simulate a failure
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));

      // When
      const promise = orchestratorClient.listWorkflowOverviews();

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('listInstances', () => {
    it('should return instances when successful', async () => {
      // Given
      const paginationInfo: PaginationInfoDTO = {
        offset: 1,
        pageSize: 5,
        orderBy: 'name',
        orderDirection: 'ASC',
      };

      const mockInstances: ProcessInstanceListResultDTO = {
        items: [{ id: 'instance123', processId: 'process001', nodes: [] }],
        paginationInfo,
      };

      const mockResponse: AxiosResponse<ProcessInstanceListResultDTO> = {
        data: mockInstances,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      // Spy DefaultApi
      const getInstancesSpy = jest.spyOn(DefaultApi.prototype, 'getInstances');

      // Mock axios request to simulate a successful response
      jest.spyOn(axios, 'request').mockResolvedValueOnce(mockResponse);

      // When
      const result = await orchestratorClient.listInstances({ paginationInfo });
      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockInstances);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith({
        ...getAxiosTestRequest('v2/workflows/instances'),
        data: JSON.stringify({ paginationInfo }),
        headers: {
          'Content-Type': 'application/json',
          ...defaultAuthHeaders,
        },
        method: 'POST',
      });
      expect(getInstancesSpy).toHaveBeenCalledTimes(1);
      expect(getInstancesSpy).toHaveBeenCalledWith(
        { paginationInfo },
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError when listing instances fails', async () => {
      // Given
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
      // When
      const promise = orchestratorClient.listInstances({});

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getInstance', () => {
    it('should return instance when successful', async () => {
      // Given
      const instanceId = 'instance123';
      const instanceIdParent = 'instance000';
      const includeAssessment = false;
      const mockInstance: AssessedProcessInstanceDTO = {
        instance: { id: instanceId, processId: 'process002', nodes: [] },
        assessedBy: {
          id: instanceIdParent,
          processId: 'process001',
          nodes: [],
        },
      };

      const mockResponse: AxiosResponse<AssessedProcessInstanceDTO> = {
        data: mockInstance,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };
      // Mock axios request to simulate a successful response
      jest.spyOn(axios, 'request').mockResolvedValueOnce(mockResponse);

      // Spy DefaultApi
      const getInstanceSpy = jest.spyOn(
        DefaultApi.prototype,
        'getInstanceById',
      );
      // When
      const result = await orchestratorClient.getInstance(
        instanceId,
        includeAssessment,
      );

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockInstance);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith(
        getAxiosTestRequest(
          `v2/workflows/instances/${instanceId}`,
          includeAssessment,
        ),
      );
      expect(getInstanceSpy).toHaveBeenCalledTimes(1);
      expect(getInstanceSpy).toHaveBeenCalledWith(
        instanceId,
        includeAssessment,
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError when fetching the instance fails', async () => {
      // Given
      const instanceId = 'instance123';

      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));
      // When
      const promise = orchestratorClient.getInstance(instanceId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  describe('getWorkflowOverview', () => {
    it('should return workflow overview when successful', async () => {
      // Given
      const workflowId = 'workflow123';
      const mockOverview = {
        workflowId: workflowId,
        name: 'Workflow 1',
        format: WorkflowFormatDTO.Yaml,
      };

      const mockResponse: AxiosResponse<WorkflowOverviewDTO> = {
        data: mockOverview,
        status: 200,
        statusText: 'OK',
        headers: {} as RawAxiosResponseHeaders,
        config: {} as InternalAxiosRequestConfig,
      };

      // Spy DefaultApi
      const getWorkflowOverviewByIdSpy = jest.spyOn(
        DefaultApi.prototype,
        'getWorkflowOverviewById',
      );

      // Mock axios request to simulate a successful response
      jest.spyOn(axios, 'request').mockResolvedValueOnce(mockResponse);

      // When
      const result = await orchestratorClient.getWorkflowOverview(workflowId);

      // Then
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockOverview);
      expect(axios.request).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledWith(
        getAxiosTestRequest(`v2/workflows/${workflowId}/overview`),
      );
      expect(getWorkflowOverviewByIdSpy).toHaveBeenCalledTimes(1);
      expect(getWorkflowOverviewByIdSpy).toHaveBeenCalledWith(
        workflowId,
        getDefaultTestRequestConfig(),
      );
    });

    it('should throw a ResponseError when fetching the workflow overview fails', async () => {
      // Given
      const workflowId = 'workflow123';

      // Given
      // Mock fetch to simulate a failure
      axios.request = jest
        .fn()
        .mockRejectedValueOnce(new Error('Simulated error'));

      // When
      const promise = orchestratorClient.getWorkflowOverview(workflowId);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
  function getDefaultTestRequestConfig(): AxiosRequestConfig {
    return {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${mockToken}` },
    };
  }

  function getAxiosTestRequest(
    endpoint: string,
    includeAssessment?: boolean,
    paginationInfo?: PaginationInfoDTO,
    method: string = 'GET',
  ): AxiosRequestConfig {
    const req = getDefaultTestRequestConfig();

    return {
      ...req,
      method,
      url: buildURLWithPagination(endpoint, includeAssessment, paginationInfo),
    };
  }

  function buildURLWithPagination(
    endpoint: string,
    includeAssessment?: boolean,
    paginationInfo?: PaginationInfoDTO,
  ): string {
    const url = new URL(endpoint, baseUrl);
    if (includeAssessment !== undefined) {
      url.searchParams.append(
        QUERY_PARAM_INCLUDE_ASSESSMENT,
        String(includeAssessment),
      );
    }
    if (paginationInfo?.offset !== undefined) {
      url.searchParams.append('page', paginationInfo.offset.toString());
    }

    if (paginationInfo?.pageSize !== undefined) {
      url.searchParams.append('pageSize', paginationInfo.pageSize.toString());
    }

    if (paginationInfo?.orderBy !== undefined) {
      url.searchParams.append('orderBy', paginationInfo.orderBy);
    }

    if (paginationInfo?.orderDirection !== undefined) {
      url.searchParams.append('orderDirection', paginationInfo.orderDirection);
    }
    return url.toString();
  }
});
