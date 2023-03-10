import useAsync, { type AsyncState } from 'react-use/lib/useAsync';
import { useBackendUrl } from '../components/api/useBackendUrl';
import { assert } from 'assert-ts';
import { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import { mockAndromedaWorkflowDefinition } from '../mocks/workflowDefinitions/andromeda';
import * as urls from '../urls';

export function useGetWorkflowDefinitions(): AsyncState<WorkflowDefinition[]> {
  const backendUrl = useBackendUrl();

  return useAsync(async function getWorkflowDefinitions(): Promise<
    WorkflowDefinition[]
  > {
    const response = await fetch(`${backendUrl}${urls.WorkflowDefinitions}`);

    const workflowDefinitions = (await response.json()) as WorkflowDefinition[];

    return [mockAndromedaWorkflowDefinition, ...workflowDefinitions];
  });
}

const predicates = {
  byId: (workflow: WorkflowDefinition) => workflow.id,
  byType: (workflow: WorkflowDefinition) => workflow.type,
  byName: (workflow: WorkflowDefinition) => workflow.name,
} as const;

type Predicates = keyof typeof predicates;

export function useGetWorkflowDefinition(
  value: string,
  filterBy: Predicates,
): AsyncState<WorkflowDefinition> {
  const result = useGetWorkflowDefinitions();

  if (!result.value) {
    return { ...result, value: undefined };
  }

  const { value: allWorkflowDefinitions } = result;

  const workflowDefinition = allWorkflowDefinitions?.find(
    def => predicates[filterBy](def) === value,
  );

  assert(!!workflowDefinition, `no workflow definition for type ${value}`);

  return { value: workflowDefinition, loading: false, error: undefined };
}
