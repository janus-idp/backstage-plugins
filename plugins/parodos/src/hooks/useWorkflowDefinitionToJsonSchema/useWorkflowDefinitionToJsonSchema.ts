import {
  GetDefinitionFilter,
  useGetWorkflowDefinition,
} from '../useGetWorkflowDefinitions';
import { workflowDefinitionSchema } from '../../models/workflowDefinitionSchema';
import { assert } from 'assert-ts';
import type { FormSchema } from '../../components/types';
import { type AsyncState } from 'react-use/lib/useAsync';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';

export function useWorkflowDefinitionToJsonSchema(
  workflowDefinition: string,
  filterType: GetDefinitionFilter,
): AsyncState<FormSchema> {
  const result = useGetWorkflowDefinition(workflowDefinition, filterType);

  if (!result.value) {
    return { ...result, value: undefined };
  }

  const { value: definition } = result;

  const parseResult = workflowDefinitionSchema.safeParse(definition);

  if (result.error) {
    return { loading: false, error: result.error, value: undefined };
  }

  assert(parseResult.success, `workflowDefinitionSchema parse failed.`);

  const { data: raw } = parseResult;

  const formSchema = jsonSchemaFromWorkflowDefinition(raw);

  return { value: formSchema, loading: false, error: undefined };
}
