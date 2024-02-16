import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { generateTestWorkflowOverview } from '../test-utils';
import {
  mapToWorkflowOverviewDTO,
  mapWorkflowCategoryDTOFromString,
} from './V2Mappings';

describe('verify v2 mapping functions', () => {
  it('mapToWorkflowOverviewDTO', () => {
    // Arrange
    const overview: WorkflowOverview = generateTestWorkflowOverview({
      category: 'assessment',
    });

    // Act
    const result = mapToWorkflowOverviewDTO(overview);

    // Assert
    expect(result.workflowId).toBe(overview.workflowId);
    expect(result.name).toBe(overview.name);
    expect(result.uri).toBe(overview.uri);
    expect(result.lastTriggeredMs).toBe(overview.lastTriggeredMs);
    expect(result.lastRunStatus).toBe(overview.lastRunStatus);
    expect(result.category).toBe('assessment');
    expect(result.avgDurationMs).toBe(overview.avgDurationMs);
    expect(result.description).toBe(overview.description);
    expect(Object.keys(result).length).toBe(8);
  });
  describe('verify mapWorkflowCategoryDTOFromString', () => {
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
      const resultCategory = mapWorkflowCategoryDTOFromString(
        overview.category,
      );

      // Assert
      expect(resultCategory).toBeDefined();
      expect(resultCategory).toBe(expected);
    });
  });
});
