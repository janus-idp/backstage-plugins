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

import { exists, mapValues } from '../runtime';

/**
 *
 * @export
 * @interface WorkflowSuggestionDTO
 */
export interface WorkflowSuggestionDTO {
  /**
   *
   * @type {string}
   * @memberof WorkflowSuggestionDTO
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof WorkflowSuggestionDTO
   */
  name?: string;
}

/**
 * Check if a given object implements the WorkflowSuggestionDTO interface.
 */
export function instanceOfWorkflowSuggestionDTO(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function WorkflowSuggestionDTOFromJSON(
  json: any,
): WorkflowSuggestionDTO {
  return WorkflowSuggestionDTOFromJSONTyped(json, false);
}

export function WorkflowSuggestionDTOFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): WorkflowSuggestionDTO {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: !exists(json, 'id') ? undefined : json['id'],
    name: !exists(json, 'name') ? undefined : json['name'],
  };
}

export function WorkflowSuggestionDTOToJSON(
  value?: WorkflowSuggestionDTO | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
  };
}
