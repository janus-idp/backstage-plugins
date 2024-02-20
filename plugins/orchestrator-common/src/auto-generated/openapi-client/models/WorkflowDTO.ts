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
import type { WorkflowCategoryDTO } from './WorkflowCategoryDTO';
import {
  WorkflowCategoryDTOFromJSON,
  WorkflowCategoryDTOFromJSONTyped,
  WorkflowCategoryDTOToJSON,
} from './WorkflowCategoryDTO';

/**
 *
 * @export
 * @interface WorkflowDTO
 */
export interface WorkflowDTO {
  /**
   * Workflow unique identifier
   * @type {string}
   * @memberof WorkflowDTO
   */
  id: string;
  /**
   * Workflow name
   * @type {string}
   * @memberof WorkflowDTO
   */
  name?: string;
  /**
   * URI of the workflow definition
   * @type {string}
   * @memberof WorkflowDTO
   */
  uri: string;
  /**
   *
   * @type {WorkflowCategoryDTO}
   * @memberof WorkflowDTO
   */
  category: WorkflowCategoryDTO;
  /**
   * Description of the workflow
   * @type {string}
   * @memberof WorkflowDTO
   */
  description?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof WorkflowDTO
   */
  annotations?: Array<string>;
}

/**
 * Check if a given object implements the WorkflowDTO interface.
 */
export function instanceOfWorkflowDTO(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'uri' in value;
  isInstance = isInstance && 'category' in value;

  return isInstance;
}

export function WorkflowDTOFromJSON(json: any): WorkflowDTO {
  return WorkflowDTOFromJSONTyped(json, false);
}

export function WorkflowDTOFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): WorkflowDTO {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    name: !exists(json, 'name') ? undefined : json['name'],
    uri: json['uri'],
    category: WorkflowCategoryDTOFromJSON(json['category']),
    description: !exists(json, 'description') ? undefined : json['description'],
    annotations: !exists(json, 'annotations') ? undefined : json['annotations'],
  };
}

export function WorkflowDTOToJSON(value?: WorkflowDTO | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    uri: value.uri,
    category: WorkflowCategoryDTOToJSON(value.category),
    description: value.description,
    annotations: value.annotations,
  };
}
