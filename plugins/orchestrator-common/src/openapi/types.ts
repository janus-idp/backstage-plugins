import { components } from '../auto-generated/api/models/schema';

export type WorkflowOverviewListResultDTO =
  components['schemas']['WorkflowOverviewListResultDTO'];
export type WorkflowOverviewDTO = components['schemas']['WorkflowOverviewDTO'];
export type WorkflowDTO = components['schemas']['WorkflowDTO'];
export type WorkflowListResultDTO =
  components['schemas']['WorkflowListResultDTO'];
export type ProcessInstanceDTO = components['schemas']['ProcessInstanceDTO'];
export type ProcessInstancesDTO = components['schemas']['ProcessInstancesDTO'];
export type WorkflowSpecFileDTO = components['schemas']['WorkflowSpecFileDTO'];
export type WorkflowContentDTO = components['schemas']['WorkflowContentDTO'];
export type WorkflowRunStatusDTO =
  components['schemas']['WorkflowRunStatusDTO'];
export type ExecuteWorkflowRequestDTO =
  components['schemas']['ExecuteWorkflowRequestDTO'];
export type ExecuteWorkflowResponseDTO =
  components['schemas']['ExecuteWorkflowResponseDTO'];
export type WorkflowSuggestionDTO =
  components['schemas']['WorkflowSuggestionDTO'];

  // Generate ts enum instead of strings union
// https://issues.redhat.com/browse/FLPATH-947
export enum WorkflowCategoryDTO {
  // Assessment Workflow
  ASSESSMENT = 'assessment',
  // Infrastructure Workflow
  INFRASTRUCTURE = 'infrastructure',
}
// Generate ts enum instead of strings union
// https://issues.redhat.com/browse/FLPATH-947
export enum ProcessInstanceStatusDTO {
  // Running
  RUNNING = 'Running',
  // Error
  ERROR = 'Error',
  // Completed
  COMPLETED = 'Completed',
  // Aborted
  ABORTED = 'Aborted',
  // Suspended
  SUSPENDED = 'Suspended',
}
