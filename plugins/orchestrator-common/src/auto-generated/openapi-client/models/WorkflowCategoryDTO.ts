// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
/**
 * Orchestrator plugin
 * API to interact with orchestrator plugin
 *
 * The version of the OpenAPI document: 0.0.1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * Category of the workflow
 * @export
 */
export const WorkflowCategoryDTO = {
  Assessment: 'assessment',
  Infrastructure: 'infrastructure',
} as const;
export type WorkflowCategoryDTO =
  (typeof WorkflowCategoryDTO)[keyof typeof WorkflowCategoryDTO];

export function WorkflowCategoryDTOFromJSON(json: any): WorkflowCategoryDTO {
  return WorkflowCategoryDTOFromJSONTyped(json, false);
}

export function WorkflowCategoryDTOFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): WorkflowCategoryDTO {
  return json as WorkflowCategoryDTO;
}

export function WorkflowCategoryDTOToJSON(
  value?: WorkflowCategoryDTO | null,
): any {
  return value as any;
}
