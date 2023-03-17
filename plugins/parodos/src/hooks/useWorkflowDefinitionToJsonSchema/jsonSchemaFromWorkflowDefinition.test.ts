import { mockRecursiveWorksWorkflowDefinition } from '../../mocks/workflowDefinitions/recursiveWorks';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import get from 'lodash.get';
import { WorkType } from '../../models/workflowDefinitionSchema';
import { mockDeepRecursiveWorks } from '../../mocks/workflowDefinitions/deepRecursiveWorks';

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

  it('transforms deeply nested recursive structure', () => {
    const result = jsonSchemaFromWorkflowDefinition(mockDeepRecursiveWorks);

    const comment = get(
      result.steps[1]?.schema,
      'properties.subWorkFlowThree.properties.works.items[1].properties.subWorkFlowTwo.properties.works.items[0].properties.subWorkFlowOne.properties.comment.title',
    );

    expect(comment).toBe('comment');

    const singleSignOn = get(
      result.steps[2]?.schema,
      'properties.subWorkFlowFour.properties.works.items[1].title',
    );

    expect(singleSignOn).toBe('Single Sign On Work Flow Task');
  });
});
