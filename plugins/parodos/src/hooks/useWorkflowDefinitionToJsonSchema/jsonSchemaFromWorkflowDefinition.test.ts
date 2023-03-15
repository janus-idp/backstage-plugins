import { mockRecursiveWorksWorkflowDefinition } from '../../mocks/workflowDefinitions/recursiveWorks';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import get from 'lodash.get';
import { WorkType } from '../../models/workflowDefinitionSchema';

describe('jsonSchemaFromWorkflowDefinition', () => {
  it('transforms a workflow definition with recursive works', () => {
    const result = jsonSchemaFromWorkflowDefinition(
      mockRecursiveWorksWorkflowDefinition,
    );

    expect(result.steps.length).toBeGreaterThan(0);

    const childSchemaWorks = get(
      result.steps[0]?.schema,
      'properties.subWorkFlowOne.properties.works.items',
      [],
    ) as WorkType[];

    const childUiSchemaWorks = get(
      result.steps[0].uiSchema,
      'subWorkFlowOne.works.items',
    );

    expect(childSchemaWorks).toHaveLength(2);
    expect(childUiSchemaWorks).toHaveLength(2);
  });
});
