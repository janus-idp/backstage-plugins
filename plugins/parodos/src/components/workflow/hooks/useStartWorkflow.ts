import { IChangeEvent } from '@rjsf/core-v5';
import { type StrictRJSFSchema } from '@rjsf/utils';
import { assert } from 'assert-ts';
import { useNavigate } from 'react-router-dom';
import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { WorkflowDefinition } from '../../../models/workflowDefinitionSchema';
import {
  WorkflowStatus,
  WorkflowTask,
} from '../../../models/workflowTaskSchema';
import { getWorklfowsPayload } from './workflowsPayload';

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
    async ({ formData }: IChangeEvent<StrictRJSFSchema>) => {
      assert(!!formData);

      const payload = getWorklfowsPayload({
        projectId,
        workflow,
        schema: formData,
      });

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
