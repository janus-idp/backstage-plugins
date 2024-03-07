import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  generateTestExecuteWorkflowResponse,
  generateTestWorkflowOverview,
} from '../test-utils';
import assessedProcessInstanceData from './__fixtures__/assessedProcessInstance.json';
import {
  mapToExecuteWorkflowResponseDTO,
  mapToGetWorkflowInstanceResults,
  mapToWorkflowOverviewDTO,
  mapWorkflowCategoryDTOFromString,
} from './V2Mappings';

describe('scenarios to verify mapToGetWorkflowInstanceResults', () => {
  it('correctly maps positive scenario response', async () => {
    const assessedProcessInstance = assessedProcessInstanceData;

    const mappedValue = mapToGetWorkflowInstanceResults(
      // @ts-ignore
      assessedProcessInstance.instance.variables,
    );

    expect(mappedValue).toBeDefined();
    expect(mappedValue.result).toBeDefined();
    expect(mappedValue.preCheck).toBeDefined();
    expect(mappedValue.workflowOptions).toBeDefined();
    expect(mappedValue.repositoryUrl).toEqual('https://java.com');
    expect(Object.keys(mappedValue).length).toBe(4);
  });

  it('correctly maps string response', async () => {
    const testValue = 'string_value';
    const mappedValue = mapToGetWorkflowInstanceResults(testValue);
    expect(mappedValue).toBeDefined();
    expect(Object.keys(mappedValue).length).toBe(1);
    expect(mappedValue.variables).toBeDefined();
    expect(mappedValue.variables).toEqual(testValue);
  });

  it('correctly returns empty workflowoptions when variables property does not exist', async () => {
    const assessedProcessInstance = assessedProcessInstanceData;

    // @ts-ignore
    delete assessedProcessInstance.instance.variables;

    const mappedValue = mapToGetWorkflowInstanceResults(
      // @ts-ignore
      assessedProcessInstance.instance.variables,
    );

    expect(mappedValue).toBeDefined();
    expect(Object.keys(mappedValue).length).toBe(1);
    expect(mappedValue.workflowoptions).toBeDefined();
    expect(mappedValue.workflowoptions?.length).toBe(0);
  });
});

describe('scenarios to verify executeWorkflowResponseDTO', () => {
  it('correctly maps positive scenario response', async () => {
    const execWorkflowResp = generateTestExecuteWorkflowResponse();
    const mappedValue = mapToExecuteWorkflowResponseDTO(
      'test_workflowId',
      execWorkflowResp,
    );
    expect(mappedValue).toBeDefined();
    expect(mappedValue.id).toBeDefined();
    expect(Object.keys(mappedValue).length).toBe(1);
  });

  it('throws error when no id attribute present in response', async () => {
    expect(() => {
      mapToExecuteWorkflowResponseDTO('workflowId', { id: '' });
    }).toThrow(
      `Error while mapping ExecuteWorkflowResponse to ExecuteWorkflowResponseDTO for workflow with id`,
    );
  });
});

describe('scenarios to verify mapToWorkflowOverviewDTO', () => {
  it('correctly maps WorkflowOverview', () => {
    // Arrange
    const overview: WorkflowOverview = generateTestWorkflowOverview({
      category: 'assessment',
    });

    // Act
    const result = mapToWorkflowOverviewDTO(overview);

    // Assert
    expect(result.workflowId).toBe(overview.workflowId);
    expect(result.name).toBe(overview.name);
    expect(result.format).toBe(overview.format);
    expect(result.lastTriggeredMs).toBe(overview.lastTriggeredMs);
    expect(result.lastRunStatus).toBe(overview.lastRunStatus);
    expect(result.category).toBe('assessment');
    expect(result.avgDurationMs).toBe(overview.avgDurationMs);
    expect(result.description).toBe(overview.description);
    expect(Object.keys(result).length).toBe(8);
  });
});
describe('scenarios to verify mapWorkflowCategoryDTOFromString', () => {
  test.each([
    { input: 'assessment', expected: 'assessment' },
    { input: 'infrastructure', expected: 'infrastructure' },
    { input: 'random category', expected: 'infrastructure' },
  ])('mapWorkflowCategoryDTOFromString($input)', ({ input, expected }) => {
    // Arrange
    const overview: WorkflowOverview = generateTestWorkflowOverview({
      category: input,
    });

    // Act
    const resultCategory = mapWorkflowCategoryDTOFromString(overview.category);

    // Assert
    expect(resultCategory).toBeDefined();
    expect(resultCategory).toBe(expected);
  });
});
