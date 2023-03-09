import { WorkflowParametersContextType } from '../context/WorkflowParametersContext';
import {
  WorkflowDefinitionType,
  WorkflowExecuteResponseType,
  WorkflowTaskArgumentType,
  WorkFlowTaskParameterType,
  WorkflowType,
} from '../../components/types';

export const startWorkflow = async ({
  projectId,
  workflow,
  getParamValue,
  backendUrl,
  setError,
}: {
  projectId: string;
  workflow: WorkflowDefinitionType;
  getParamValue: WorkflowParametersContextType['getParamValue'];
  backendUrl: string;
  setError: (message: string) => void;
}): Promise<string /* executionId */ | undefined> => {
  const body: WorkflowType = {
    projectId,
    workFlowName: workflow.name || 'missing',
    workFlowTasks:
      workflow.tasks.map(task => {
        const args: WorkflowTaskArgumentType[] = [];
        task.parameters?.forEach(param => {
          const value = getParamValue(param.key);
          if (value) {
            args.push({ key: param.key, value });
          }
        });

        return {
          name: task.name,
          arguments: args,
        };
      }) || [],
  };

  try {
    const data = await fetch(`${backendUrl}/api/proxy/parodos/workflows`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const response = (await data.json()) as WorkflowExecuteResponseType;
    const executionId = response.workFlowExecutionId;

    return executionId;
  } catch (e) {
    setError('Failed to start workflow');
    // eslint-disable-next-line no-console
    console.error('Failed to start workflow: ', e);
  }

  return undefined;
};

const getAllFlattenedParameters = (
  allWorkflowDefinitions: WorkflowDefinitionType[],
  workflowDefinition: WorkflowDefinitionType,
): WorkFlowTaskParameterType[] => {
  const tasks = workflowDefinition.tasks || [];
  const paramsOfAllTasks: WorkFlowTaskParameterType[][] = tasks.map(task => {
    const taskParameters = task.parameters || [];
    // TODO: more filtering or mapping?
    return taskParameters;
  });
  const allFlatParameters: WorkFlowTaskParameterType[] =
    paramsOfAllTasks.flat();

  // Deep-dive into sub-workflows
  // Assumption: there are no loops in the workflow definitions
  tasks.forEach(task => {
    if (!task.nextWorkFlow) {
      return;
    }

    const subworkflowDefinition = allWorkflowDefinitions.find(
      def => def.id === task.nextWorkFlow,
    );
    if (!subworkflowDefinition) {
      // eslint-disable-next-line no-console
      console.info('Can not find subworkflow definition for task: ', task);
      return;
    }
    allFlatParameters.push(
      ...getAllFlattenedParameters(
        allWorkflowDefinitions,
        subworkflowDefinition,
      ),
    );
  });

  return allFlatParameters;
};

// TODO: Gather workflow-level parameters as well. So far we collect task-level parameters only since the Workflow-level params are missing in the swagger.
export const getWorkflowParameters = (
  allWorkflowDefinitions: WorkflowDefinitionType[],
  workflowDefinition: WorkflowDefinitionType,
): WorkFlowTaskParameterType[] => {
  const allFlatParameters = getAllFlattenedParameters(
    allWorkflowDefinitions,
    workflowDefinition,
  );

  // Filter unique by key
  // Assumptions:
  // - the "key" of a parameter is unique over all workflow definitions and tasks
  const filteredParameters: WorkFlowTaskParameterType[] = [];
  const map = new Map();
  for (const item of allFlatParameters) {
    if (!map.has(item.key)) {
      map.set(item.key, true);
      filteredParameters.push(item);
    }
  }

  return filteredParameters;
};
