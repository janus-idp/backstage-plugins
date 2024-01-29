import { components } from '../auto-generated/api/models/schema';

export type WorkflowOverviewListResultDTO =
  components['schemas']['WorkflowOverviewListResultDTO'];
export type WorkflowOverviewDTO = components['schemas']['WorkflowOverviewDTO'];
export type WorkflowDTO = components['schemas']['WorkflowDTO'];
export type WorkflowListResultDTO =
  components['schemas']['WorkflowListResultDTO'];
export type ProcessInstanceDTO = components['schemas']['ProcessInstanceDTO'];
export type ProcessInstancesDTO = components['schemas']['ProcessInstancesDTO'];

// FIX ME
export enum WorkflowCategoryDTO {
  // Assessment Workflow
  ASSESSMENT = 'assessment',
  // Infrastructure Workflow
  INFRASTRUCTURE = 'infrastructure',
}

// FIX ME
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
