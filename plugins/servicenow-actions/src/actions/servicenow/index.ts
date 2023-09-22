import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import { createNowActions } from '.';

/**
 * Returns all ServiceNow actions.
 *
 * @returns {TemplateAction[]}
 */
export function createServiceNowActions(): TemplateAction[] {
  return [...createNowActions()] as TemplateAction[];
}

export * from './now';
