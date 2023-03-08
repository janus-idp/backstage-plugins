import { type AsyncState } from 'react-use/lib/useAsync';
import { useGetWorkflowDefinition } from '../../hooks/useGetWorkflowDefinitions';
import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema';

export function useGetProjectAssessmentSchema(): AsyncState<FormSchema> {
  // TODO: check this
  const result = useGetWorkflowDefinition('ASSESSMENT', 'byType');

  if (!result.value) {
    return { ...result, value: undefined };
  }

  const cloned = { ...result.value };

  // not sure why this is not coming from the API
  cloned.tasks.unshift({
    id: 'project-name',
    name: 'project-name',
    parameters: [
      {
        key: 'Name',
        description: 'New Project',
        optional: false,
        type: 'TEXT',
      },
    ],
    outputs: [],
  });

  const formSchema = jsonSchemaFromWorkflowDefinition(cloned);

  return { ...result, value: formSchema };
}
