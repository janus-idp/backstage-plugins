import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import { createRecordAction } from '.';

/**
 * Returns all ServiceNow `now` namespace `Table API` actions.
 *
 * @returns {TemplateAction[]}
 */
export function createTableActions(): TemplateAction[] {
  return [createRecordAction()] as TemplateAction[];
}

export * from './create-record';
