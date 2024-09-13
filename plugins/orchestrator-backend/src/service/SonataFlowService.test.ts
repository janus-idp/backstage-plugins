import { LoggerService } from '@backstage/backend-plugin-api';

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

    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return workflow execution response when the request is successful', async () => {
      // Given
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest
          .fn()
          .mockResolvedValue({ id: definitionId, status: 'completed' }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

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
      const inputData = { var1: 'value1' };
      const mockResponse = {
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ id: definitionId, status: 'completed' }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

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
      // Given
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValueOnce({}),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);
      const inputData = { var1: 'value1' };

      // When
      const result = await sonataFlowService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
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
        `Error when executing workflow: Error: ${sonataFlowService.createPrefixFetchErrorMessage(urlToFetch, functionName, 'POST')} - Details: undefined, Stack: undefined`,
      );
    });
    it('should log an error and return undefined when the fetch response is not ok with extra info', async () => {
      // Given
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValueOnce({
          details: 'Error details test',
          stack: 'Error stacktrace test',
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);
      const inputData = { var1: 'value1' };

      // When
      const result = await sonataFlowService.executeWorkflow({
        definitionId,
        serviceUrl,
        inputData,
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
      const inputData = { var1: 'value1' };

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
