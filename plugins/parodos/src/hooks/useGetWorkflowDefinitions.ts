import useAsync, { type AsyncState } from 'react-use/lib/useAsync';
import { useBackendUrl } from '../components/api/useBackendUrl';
import { assert } from 'assert-ts';
import { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import * as urls from '../urls';
import { WorkFlowTask } from '../components/workflow/workflowDetail/topology/type/WorkFlowTask';

export function useGetWorkflowDefinitions(): AsyncState<WorkflowDefinition[]> {
  const backendUrl = useBackendUrl();

  return useAsync(async function getWorkflowDefinitions(): Promise<
    WorkflowDefinition[]
  > {
    const response = await fetch(`${backendUrl}${urls.WorkflowDefinitions}`);

    return (await response.json()) as WorkflowDefinition[];
  });
}

const predicates = {
  byId: (workflow: WorkflowDefinition) => workflow.id,
  byType: (workflow: WorkflowDefinition) => workflow.type,
  byName: (workflow: WorkflowDefinition) => workflow.name,
} as const;

export type GetDefinitionFilter = keyof typeof predicates;

export function useGetWorkflowDefinition(
  value: string,
  filterBy: GetDefinitionFilter,
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

export function useGetWorkflowTasksForTopology(
  selectedWorkFlowName: string,
): AsyncState<WorkFlowTask[]> {
  const workflowDefinitions = useGetWorkflowDefinitions();

  if (!workflowDefinitions.value) {
    return { ...workflowDefinitions, value: undefined };
  }
  const { value: allWorkflowDefinitions } = workflowDefinitions;
  const rootWorkflowDefinition = allWorkflowDefinitions?.find(
    workflowDefinition => workflowDefinition.name === selectedWorkFlowName,
  );
  const result: WorkFlowTask[] = [];
  result.push({
    id: 'Project Information',
    status: 'completed',
    locked: false,
    label: 'Project Information',
    runAfterTasks: [],
  });
  rootWorkflowDefinition?.tasks.forEach(task => {
    result.push({
      id: task.name,
      status: 'pending',
      locked: false,
      label: task.name,
      runAfterTasks: [result[0].id],
    });
    if (task.nextWorkFlow)
      addTasks(
        result,
        task.nextWorkFlow,
        task.name,
        allWorkflowDefinitions,
        task.workFlowChecker !== undefined,
      );
  });
  return { value: result, loading: false, error: undefined };
}

function addTasks(
  result: WorkFlowTask[],
  workflowName: string,
  previousTaskName: string,
  allWorkflowDefinitions: WorkflowDefinition[],
  hasChecker: boolean = false,
) {
  const targetWorkflowDefinition = allWorkflowDefinitions?.filter(
    workflowDefinition => workflowDefinition.id === workflowName,
  )[0];
  targetWorkflowDefinition?.tasks.forEach(task => {
    let foundTask = result.find(existingTask => existingTask.id === task.name);
    if (!foundTask) {
      foundTask = {
        id: task.name,
        status: 'pending',
        locked: hasChecker,
        label: task.name,
        runAfterTasks: [previousTaskName],
      };
      result.push(foundTask);
    } else foundTask.runAfterTasks.push(previousTaskName);
    foundTask.runAfterTasks = [...new Set(foundTask?.runAfterTasks)];
    if (task.nextWorkFlow)
      addTasks(
        result,
        task.nextWorkFlow,
        task.name,
        allWorkflowDefinitions,
        true,
      );
  });
}
