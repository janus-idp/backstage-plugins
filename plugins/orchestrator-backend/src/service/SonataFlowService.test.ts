import { LoggerService } from '@backstage/backend-plugin-api';

import { WorkflowExecutionResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from './DataIndexService';
import { SonataFlowService } from './SonataFlowService';

describe('SonataFlowService', () => {
  let loggerMock: jest.Mocked<LoggerService>;
  let sonataFlowService: SonataFlowService;

  beforeAll(() => {
    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn(),
    };
    sonataFlowService = new SonataFlowService(
      {} as DataIndexService,
      loggerMock,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchWorkflowInfoOnService', () => {
    const serviceUrl = 'http://example.com';
    const definitionId = 'workflow-123';
    const urlToFetch = 'http://example.com/management/processes/workflow-123';
    const methodName = 'fetchWorkflowInfoOnService';
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return workflow info when the fetch response is ok', async () => {
      // Given
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'workflow-123' }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

      // When
      const result = await sonataFlowService.fetchWorkflowInfoOnService({
        definitionId,
        serviceUrl,
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch);
      expect(result).toEqual({ id: definitionId });
      expect(loggerMock.debug).toHaveBeenCalledWith(
        `Fetch workflow info result: {"id":"${definitionId}"}`,
      );
    });

    it('should log an error and return undefined when the fetch response is not ok', async () => {
      // Given
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({
          details: 'Error details',
          stack: 'Error stack trace',
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

      // When
      const result = await sonataFlowService.fetchWorkflowInfoOnService({
        definitionId,
        serviceUrl,
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch);
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(
        `Error when fetching workflow info: Error: ${sonataFlowService.createPrefixFetchErrorMessage(urlToFetch, methodName)}`,
      );
      expect(loggerMock.info).not.toHaveBeenCalled();
      expect(loggerMock.debug).not.toHaveBeenCalled();
      expect(loggerMock.warn).not.toHaveBeenCalled();
      expect(loggerMock.child).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined when fetch throws an error', async () => {
      // Given
      const testErrorMsg = 'Network Error';
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      // When
      const result = await sonataFlowService.fetchWorkflowInfoOnService({
        definitionId,
        serviceUrl,
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch);
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        `Error when fetching workflow info: Error: ${testErrorMsg}`,
      );
    });
  });
  describe('executeWorkflow', () => {
    const serviceUrl = 'http://example.com/workflows';
    const definitionId = 'workflow-123';
    const urlToFetch = `${serviceUrl}/${definitionId}`;
    const functionName = 'executeWorkflow';
    const inputData = { var1: 'value1' };

    const setupTest = (responseConfig: {
      ok: boolean;
      status?: number;
      json: any;
    }) => {
      const mockResponse = {
        ok: responseConfig.ok,
        status: responseConfig.status || (responseConfig.ok ? 200 : 500),
        statusText: responseConfig.ok ? 'OK' : 'Internal Server Error',
        json: jest.fn().mockResolvedValue(responseConfig.json),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);
    };

    const runErrorTest = async (
      jsonResponse: any,
    ): Promise<WorkflowExecutionResponse | undefined> => {
      setupTest({ ok: false, json: jsonResponse });
      return await sonataFlowService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
      });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return workflow execution response when the request is successful', async () => {
      // Given
      setupTest({ ok: true, json: { id: definitionId, status: 'completed' } });

      // When
      const result = await sonataFlowService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData: { var1: 'value1' },
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch, {
        method: 'POST',
        body: JSON.stringify({ var1: 'value1' }),
        headers: { 'content-type': 'application/json' },
      });
      expect(result).toEqual({ id: definitionId, status: 'completed' });
      expect(loggerMock.debug).toHaveBeenCalledWith(
        `Execute workflow result: {"id":"${definitionId}","status":"completed"}`,
      );
      // Verify that all other logger methods were not called
      expect(loggerMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).not.toHaveBeenCalled();
      expect(loggerMock.error).not.toHaveBeenCalled();
      expect(loggerMock.warn).not.toHaveBeenCalled();
      expect(loggerMock.child).not.toHaveBeenCalled();
    });

    it('should include businessKey in the URL if provided', async () => {
      // Given
      const businessKey = 'key-123';
      setupTest({ ok: true, json: { id: definitionId, status: 'completed' } });

      // When
      const result = await sonataFlowService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
        businessKey,
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(
        `${serviceUrl}/${definitionId}?businessKey=${businessKey}`,
        {
          method: 'POST',
          body: JSON.stringify(inputData),
          headers: { 'content-type': 'application/json' },
        },
      );
      expect(result).toEqual({ id: definitionId, status: 'completed' });
    });

    it('should log an error and return undefined when the fetch response is not ok without extra info', async () => {
      // When
      const result = await runErrorTest({});

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch, {
        method: 'POST',
        body: JSON.stringify(inputData),
        headers: { 'content-type': 'application/json' },
      });
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(
        `Error when executing workflow: Error: ${sonataFlowService.createPrefixFetchErrorMessage(urlToFetch, functionName, 'POST')} - Details: undefined, Stack: undefined`,
      );
    });
    it('should log an error and return undefined when the fetch response is not ok with extra info', async () => {
      // When
      const result = await runErrorTest({
        details: 'Error details test',
        stack: 'Error stacktrace test',
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch, {
        method: 'POST',
        body: JSON.stringify(inputData),
        headers: { 'content-type': 'application/json' },
      });
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(
        `Error when executing workflow: Error: ${sonataFlowService.createPrefixFetchErrorMessage(urlToFetch, functionName, 'POST')} - Details: Error details test, Stack: Error stacktrace test`,
      );
    });
    it('should log an error and return undefined when fetch throws an error', async () => {
      // Given
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      // When
      const result = await sonataFlowService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData: inputData,
      });

      // Then
      expect(fetch).toHaveBeenCalledWith(urlToFetch, {
        method: 'POST',
        body: JSON.stringify(inputData),
        headers: { 'content-type': 'application/json' },
      });
      expect(result).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error when executing workflow: Error: Network Error',
      );
    });
  });
});
