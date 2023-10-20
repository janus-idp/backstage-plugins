import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import { createNowActions } from '.';
import { CreateActionOptions } from '../types';

/**
 * Returns all ServiceNow actions.
 *
 * @returns {TemplateAction[]}
 */
export function createServiceNowActions(
  options: CreateActionOptions,
): TemplateAction[] {
  return [...createNowActions(options)] as TemplateAction[];
}

export * from './now';
