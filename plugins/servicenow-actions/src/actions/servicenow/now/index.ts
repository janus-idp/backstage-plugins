import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import { createTableActions } from '.';

/**
 * Returns all ServiceNow `now` namespace actions.
 *
 * @returns {TemplateAction[]}
 */
export function createNowActions(): TemplateAction[] {
  return [...createTableActions()] as TemplateAction[];
}

export * from './table';
