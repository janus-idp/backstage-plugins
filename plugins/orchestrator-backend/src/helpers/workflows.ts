import {
  ASSESSMENT_WORKFLOW_TYPE,
  WorkflowCategory,
  WorkflowDefinition,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export const getWorkflowCategory = (
  workflowDefinition?: WorkflowDefinition,
): WorkflowCategory =>
  workflowDefinition?.annotations?.find(
    annotation => annotation === ASSESSMENT_WORKFLOW_TYPE,
  )
    ? WorkflowCategory.ASSESSMENT
    : WorkflowCategory.INFRASTRUCTURE;
