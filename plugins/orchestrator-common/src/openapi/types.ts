import { components } from '../auto-generated/api/models/schema';

export type WorkflowOverviewListResultDTO =
  components['schemas']['WorkflowOverviewListResultDTO'];
export type WorkflowOverviewDTO = components['schemas']['WorkflowOverviewDTO'];

// Generate ts enum instead of strings union
// https://issues.redhat.com/browse/FLPATH-947
export enum WorkflowCategoryDTO {
  // Assessment Workflow
  ASSESSMENT = 'assessment',
  // Infrastructure Workflow
  INFRASTRUCTURE = 'infrastructure',
}
