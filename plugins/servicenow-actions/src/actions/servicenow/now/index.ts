import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import { createTableActions } from '.';
import { CreateActionOptions } from '../../types';

/**
 * Returns all ServiceNow `now` namespace actions.
 *
 * @returns {TemplateAction[]}
 */
export function createNowActions(
  options: CreateActionOptions,
): TemplateAction[] {
  return [...createTableActions(options)] as TemplateAction[];
}

export * from './table';
