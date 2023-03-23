import { assert } from 'assert-ts';
import { type SafeParseReturnType } from 'zod';
import { mockRecursiveWorksWorkflowDefinition } from '../mocks/workflowDefinitions/recursiveWorks';
import {
  WorkflowDefinition,
  workflowDefinitionSchema,
} from './workflowDefinitionSchema';

describe('WorkflowDefinitionSchema', () => {
  let result: SafeParseReturnType<unknown, WorkflowDefinition>;

  beforeEach(() => {
    result = workflowDefinitionSchema.safeParse(
      mockRecursiveWorksWorkflowDefinition,
    );
  });

  it('parses the API workflow definitions', () => {
    expect(result.success).toBe(true);

    assert(result.success);

    expect(result.data.works[0]?.works?.[0].name).toBe('adGroupsWorkFlowTask');
  });

  it('should coerce required correctly', () => {
    expect(result.success).toBe(true);

    assert(result.success);

    const required =
      result.data.works[0]?.works?.[0].parameters?.adGroups?.required;

    expect(typeof required).toBe('boolean');

    expect(required).toBe(false);
  });
});
