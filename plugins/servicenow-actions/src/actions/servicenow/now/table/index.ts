import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import {
  createRecordAction,
  deleteRecordAction,
  modifyRecordAction,
  retrieveRecordAction,
  retrieveRecordsAction,
  updateRecordAction,
} from '.';
import { CreateActionOptions } from '../../../types';

/**
 * Returns all ServiceNow `now` namespace `Table API` actions.
 *
 * @returns {TemplateAction[]}
 */
export function createTableActions(
  options: CreateActionOptions,
): TemplateAction[] {
  return [
    createRecordAction(options),
    deleteRecordAction(options),
    modifyRecordAction(options),
    retrieveRecordAction(options),
    retrieveRecordsAction(options),
    updateRecordAction(options),
  ] as TemplateAction[];
}

export * from './create-record';
export * from './delete-record';
export * from './modify-record';
export * from './retrieve-record';
export * from './retrieve-records';
export * from './update-record';
