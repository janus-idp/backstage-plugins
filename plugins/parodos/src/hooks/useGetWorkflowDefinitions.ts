import useAsync, { type AsyncState } from 'react-use/lib/useAsync';
import { useBackendUrl } from '../components/api/useBackendUrl';
import { assert } from 'assert-ts';
import {
  WorkflowDefinition,
  WorkType,
} from '../models/workflowDefinitionSchema';
import * as urls from '../urls';
import { taskDisplayName } from '../utils/string';
import { WorkflowTask } from '../models/workflowTaskSchema';

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
): AsyncState<WorkflowTask[]> {
  const workflowDefinitions = useGetWorkflowDefinitions();

  if (!workflowDefinitions.value) {
    return { ...workflowDefinitions, value: undefined };
  }
  const { value: allWorkflowDefinitions } = workflowDefinitions;
  const rootWorkflowDefinition = allWorkflowDefinitions?.find(
    workflowDefinition => workflowDefinition.name === selectedWorkFlowName,
  );
  const result: WorkflowTask[] = [];
  result.push({
    id: 'Project Information',
    status: 'COMPLETED',
    locked: false,
    label: 'Project Information',
    runAfterTasks: [],
  });
  if (rootWorkflowDefinition)
    addTasks(result, rootWorkflowDefinition, [result[0].id]);

  return { value: result, loading: false, error: undefined };
}

function addTasks(
  result: WorkflowTask[],
  work: WorkType | WorkflowDefinition,
  runAfterTasks: string[],
): string[] {
  let previousTasks: string[] = [];

  work.works?.forEach((subWork, index) => {
    if (subWork.workType === 'TASK') {
      result.push({
        id: subWork.name,
        status: 'PENDING',
        locked: false,
        label: taskDisplayName(subWork.name),
        runAfterTasks:
          work.processingType === 'PARALLEL' || index === 0
            ? runAfterTasks
            : previousTasks,
      });

      if (work.processingType === 'PARALLEL') {
        previousTasks = [...previousTasks, subWork.name];
      } else previousTasks = [subWork.name];
    } else {
      const tasks = addTasks(
        result,
        subWork,
        work.processingType === 'PARALLEL' || index === 0
          ? runAfterTasks
          : previousTasks,
      );
      previousTasks =
        work.processingType === 'PARALLEL'
          ? [...tasks, ...previousTasks]
          : tasks;
    }
  });
  return previousTasks;
}
