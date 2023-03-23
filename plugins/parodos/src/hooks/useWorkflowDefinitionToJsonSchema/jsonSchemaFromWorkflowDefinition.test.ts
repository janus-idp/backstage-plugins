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

    const domainName = get(
      result.steps[0]?.schema,
      'properties.sslCertificationWorkFlowTask.properties.domainName.title',
    );

    expect(domainName).toBe('domainName');
    const clusterName = get(
      result.steps[1]?.schema,
      'properties.subWorkFlowTwo.properties.works.items[0].properties.subWorkFlowOne.properties.works.items[1].properties.splunkMonitoringWorkFlowTask.properties.clusterName.title',
    );

    expect(clusterName).toBe('clusterName');
  });
});
