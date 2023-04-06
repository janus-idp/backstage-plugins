import { workflowDefinitionSchema } from '../../models/workflowDefinitionSchema';
import type { FormSchema } from '../../components/types';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import { GetDefinitionFilter } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';

export function useWorkflowDefinitionToJsonSchema(
  workflowDefinition: string,
  filterType: GetDefinitionFilter,
): FormSchema {
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);
  const definition = getWorkDefinitionBy(filterType, workflowDefinition);

  const raw = workflowDefinitionSchema.parse(definition);

  return jsonSchemaFromWorkflowDefinition(raw);
}
