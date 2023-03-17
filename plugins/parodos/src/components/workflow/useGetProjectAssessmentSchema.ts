import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import { ASSESSMENT_WORKFLOW } from './constants';
import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';

export function useGetProjectAssessmentSchema(): FormSchema {
  const definition = useStore(state =>
    state.getWorkDefinitionBy('byName', ASSESSMENT_WORKFLOW),
  );

  const cloned = JSON.parse(JSON.stringify(definition)) as WorkflowDefinition;

  // TODO: this should be coming from the API
  cloned.works[0].parameters?.unshift({
    key: 'Name',
    description: 'New Project',
    optional: false,
    type: 'TEXT',
  });

  const formSchema = jsonSchemaFromWorkflowDefinition(cloned);

  return formSchema;
}
