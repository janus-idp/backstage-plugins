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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return workflow info when the fetch response is ok', async () => {
      // Given
      const mockResponse: Partial<Response> = {
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

    it('should propagate thrown error when the fetch response is not ok', async () => {
      // Given
      const mockResponse: Partial<Response> = {
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
      let result;
      try {
        await sonataFlowService.fetchWorkflowInfoOnService({
          definitionId,
          serviceUrl,
        });
      } catch (error) {
        result = error;
      }

      expect(result).toBeDefined();
    });

    it('should propagate thrown error when fetch throws an error', async () => {
      // Given
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      // When
      let result;
      try {
        await sonataFlowService.fetchWorkflowInfoOnService({
          definitionId,
          serviceUrl,
        });
      } catch (error) {
        result = error;
      }

      expect(result).toBeDefined();
    });
  });
  describe('executeWorkflow', () => {
    const serviceUrl = 'http://example.com/workflows';
    const definitionId = 'workflow-123';
    const urlToFetch = `${serviceUrl}/${definitionId}`;
    const inputData = { var1: 'value1' };

    const expectedFetchRequestInit = (): RequestInit => {
      return {
        method: 'POST',
        body: JSON.stringify(inputData),
        headers: { 'content-type': 'application/json' },
      };
    };

    const setupTest = (responseConfig: {
      ok: boolean;
      status?: number;
      statusText?: string;
      json: any;
    }): Partial<Response> => {
      const mockResponse: Partial<Response> = {
        ok: responseConfig.ok,
        status: responseConfig.status || (responseConfig.ok ? 200 : 500),
        statusText: responseConfig.statusText,
        json: jest.fn().mockResolvedValue(responseConfig.json),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);
      return mockResponse;
    };

    const runErrorTest = async (): Promise<
      WorkflowExecutionResponse | undefined
    > => {
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
      expect(fetch).toHaveBeenCalledWith(
        urlToFetch,
        expectedFetchRequestInit(),
      );
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
        expectedFetchRequestInit(),
      );
      expect(result).toEqual({ id: definitionId, status: 'completed' });
    });
    it('should propagate thrown error when the fetch response is not ok without extra info', async () => {
      // When
      setupTest({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: { details: undefined, stack: undefined },
      });

      let result;
      try {
        await runErrorTest();
      } catch (error) {
        result = error;
      }

      expect(result).toBeDefined();
    });
    it('should propagate thrown exception when the fetch response is not ok with extra info', async () => {
      // When
      setupTest({
        ok: false,
        json: { details: 'Error details test', stack: 'Error stacktrace test' },
      });

      let result;
      try {
        await runErrorTest();
      } catch (error) {
        result = error;
      }

      expect(result).toBeDefined();
    });
    it('should propagate thrown error when fetch throws an error', async () => {
      // Given
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      // When
      let result;
      try {
        await sonataFlowService.executeWorkflow({
          definitionId,
          serviceUrl,
          inputData: inputData,
        });
      } catch (error) {
        result = error;
      }

      expect(result).toBeDefined();
    });
  });

  describe('createPrefixFetchErrorMessage', () => {
    // Constants
    const TEST_URL = 'http://example.com';
    const STATUS_TEXT_BAD_REQUEST = 'Bad Request';
    const STATUS_TEXT_NOT_FOUND = 'Not Found';
    const STATUS_TEXT_INTERNAL_SERVER_ERROR = 'Internal Server Error';
    const DETAILS = 'Some error details';
    const STACK_TRACE = 'Error stack trace';

    it('should return the correct message with all fields provided', async () => {
      // Given
      const mockResponseJson = { details: DETAILS, stack: STACK_TRACE };
      const mockResponse = new Response(JSON.stringify(mockResponseJson), {
        status: 400,
        statusText: STATUS_TEXT_BAD_REQUEST,
      });

      // When
      const result = await sonataFlowService.createPrefixFetchErrorMessage(
        TEST_URL,
        mockResponse,
        'POST',
      );

      // Then
      const expectedMessage = `Request POST ${TEST_URL} failed with: StatusCode: 400 StatusText: ${STATUS_TEXT_BAD_REQUEST}, Details: ${DETAILS}, Stack: ${STACK_TRACE}`;
      expect(result).toBe(expectedMessage);
    });

    it('should return the correct message without details and stack', async () => {
      // Given
      const mockResponseJson = {};
      const mockResponse = new Response(JSON.stringify(mockResponseJson), {
        status: 404,
        statusText: STATUS_TEXT_NOT_FOUND,
      });

      // When
      const result = await sonataFlowService.createPrefixFetchErrorMessage(
        TEST_URL,
        mockResponse,
      );

      // Then
      const expectedMessage = `Request GET ${TEST_URL} failed with: StatusCode: 404 StatusText: ${STATUS_TEXT_NOT_FOUND}`;
      expect(result).toBe(expectedMessage);
    });

    it('should return the correct message with only status code', async () => {
      // Given
      const mockResponseJson = {};
      const mockResponse = new Response(JSON.stringify(mockResponseJson), {
        status: 500,
      });

      // When
      const result = await sonataFlowService.createPrefixFetchErrorMessage(
        TEST_URL,
        mockResponse,
      );

      // Then
      const expectedMessage = `Request GET ${TEST_URL} failed with: StatusCode: 500 Unexpected error`;
      expect(result).toBe(expectedMessage);
    });

    it('should return the unexpected error message if no other fields are present', async () => {
      // Given
      const mockResponseJson = {};
      const mockResponse = new Response(JSON.stringify(mockResponseJson));

      // When
      const result = await sonataFlowService.createPrefixFetchErrorMessage(
        TEST_URL,
        mockResponse,
      );

      // Then
      const expectedMessage = `Request GET ${TEST_URL} failed with: StatusCode: 200 Unexpected error`;
      expect(result).toBe(expectedMessage);
    });

    it('should handle response with undefined JSON gracefully', async () => {
      // Given
      const mockResponse = new Response(undefined, {
        status: 500,
        statusText: STATUS_TEXT_INTERNAL_SERVER_ERROR,
      });
      jest.spyOn(mockResponse, 'json').mockResolvedValue(undefined);

      // When
      const result = await sonataFlowService.createPrefixFetchErrorMessage(
        TEST_URL,
        mockResponse,
      );

      // Then
      const expectedMessage = `Request GET ${TEST_URL} failed with: StatusCode: 500 StatusText: ${STATUS_TEXT_INTERNAL_SERVER_ERROR}`;
      expect(result).toBe(expectedMessage);
    });
  });
});
