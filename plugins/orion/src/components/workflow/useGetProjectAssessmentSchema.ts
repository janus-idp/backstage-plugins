import { type AsyncState } from 'react-use/lib/useAsync';
import { useGetWorkflowDefinition } from '../../hooks/useGetWorkflowDefinitions';
import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema';
import { ASSESSMENT_WORKFLOW } from './constants';

export function useGetProjectAssessmentSchema(): AsyncState<FormSchema> {
  const result = useGetWorkflowDefinition(ASSESSMENT_WORKFLOW, 'byName');

  if (!result.value) {
    return { ...result, value: undefined };
  }

  const cloned = JSON.parse(JSON.stringify(result.value));

  // TODO: this should be coming from the API
  cloned.tasks[0].parameters.unshift({
    key: 'Name',
    description: 'New Project',
    optional: false,
    type: 'TEXT',
  });

  const formSchema = jsonSchemaFromWorkflowDefinition(cloned);

  return { ...result, value: formSchema };
}
