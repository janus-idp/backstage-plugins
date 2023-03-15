import { assert } from 'assert-ts';
import { mockRecursiveWorksWorkflowDefinition } from '../mocks/workflowDefinitions/recursiveWorks';
import { workflowDefinitionSchema } from './workflowDefinitionSchema';

describe('WorkflowDefinitionSchema', () => {
  it('parses the API workflow definitions', () => {
    const result = workflowDefinitionSchema.safeParse(
      mockRecursiveWorksWorkflowDefinition,
    );

    expect(result.success).toBe(true);

    assert(result.success);

    // recursive works check
    expect(result.data.works[0]?.works?.[0].name).toBe('adGroupsWorkFlowTask');
  });
});
