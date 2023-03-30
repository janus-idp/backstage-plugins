import { IChangeEvent } from '@rjsf/core-v5';
import get from 'lodash.get';
import { useNavigate } from 'react-router-dom';
import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { WorkflowDefinition } from '../../../models/workflowDefinitionSchema';
import {
  WorkflowStatus,
  WorkflowTask,
} from '../../../models/workflowTaskSchema';

interface UseStartWorkflow {
  workflowsUrl: string;
  workflow: WorkflowDefinition;
  projectId: string;
  tasks: WorkflowTask[];
  isNew: boolean;
}

export function useStartWorkflow({
  workflowsUrl,
  workflow,
  projectId,
  tasks,
  isNew,
}: UseStartWorkflow): AsyncFnReturn<
  ({ formData }: IChangeEvent) => Promise<void>
> {
  const navigate = useNavigate();

  return useAsyncFn(
    async ({ formData }: IChangeEvent) => {
      const payload = {
        projectId,
        workFlowName: workflow.name,
        arguments: Object.entries(workflow.parameters ?? {}).map(([key]) => {
          const value = get(formData, `${workflow.name}.${key}`, null);

          return {
            key,
            value,
          };
        }),
        works: workflow.works.map(work => {
          return {
            workName: work.name,
            // TODO: need some guidance about what to do with nested works
            arguments: Object.entries(work.parameters ?? {}).map(([key]) => {
              const value = get(formData, `${work.name}.${key}`, null);

              return {
                key,
                value,
              };
            }),
          };
        }),
      };

      const data = await fetch(workflowsUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!data.ok) {
        throw new Error(`${data.status} - ${data.statusText}`);
      }

      const response = (await data.json()) as WorkflowStatus;
      const executionId = response.workFlowExecutionId;

      navigate(`/parodos/onboarding/${executionId}/workflow-detail`, {
        state: { isNew: isNew, initTasks: tasks },
      });
    },
    [workflow, projectId, workflowsUrl, navigate, isNew, tasks],
  );
}
