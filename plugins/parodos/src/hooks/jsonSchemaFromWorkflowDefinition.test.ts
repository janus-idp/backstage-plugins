import { mockRecursiveWorksWorkflowDefinition } from '../mocks/workflowDefinitions/recursiveWorks';
import { jsonSchemaFromWorkflowDefinition } from './useWorkflowDefinitionToJsonSchema';
import get from 'lodash.get';
import { WorkType } from '../models/workflowDefinitionSchema';

describe('jsonSchemaFromWorkflowDefinition', () => {
  it('transforms a workflow definition with recursive works', () => {
    const result = jsonSchemaFromWorkflowDefinition(
      mockRecursiveWorksWorkflowDefinition,
    );

    expect(result.steps.length).toBeGreaterThan(0);

    const key = Object.keys(result.steps[0].schema)[0];
    const childWorks = get(
      result.steps[0]?.schema,
      `properties.${key}.properties.works.items`,
      [],
    ) as WorkType[];

    expect(childWorks).toHaveLength(2);
  });
});
