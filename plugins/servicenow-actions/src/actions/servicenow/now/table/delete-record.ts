import {
  createTemplateAction,
  type TemplateAction,
} from '@backstage/plugin-scaffolder-node';

import { z } from 'zod';

import {
  ApiError,
  DefaultService,
  OpenAPI,
} from '../../../../generated/now/table';
import { CreateActionOptions } from '../../../types';

/**
 * Schema for the input to the `deleteRecord` action.
 *
 * @see {@link https://docs.servicenow.com/bundle/vancouver-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html#title_table-DELETE}
 */
const schemaInput = z.object({
  tableName: z
    .string()
    .nonempty()
    .describe('Name of the table in which to delete the record'),
  sysId: z
    .string()
    .nonempty()
    .describe('Unique identifier of the record to delete'),
  sysparmQueryNoDomain: z
    .boolean()
    .optional()
    .describe(
      'True to access data across domains if authorized (default: false)',
    ),
});

const id = 'servicenow:now:table:deleteRecord';

export const deleteRecordAction = (
  options: CreateActionOptions,
): TemplateAction => {
  const { config } = options;

  return createTemplateAction({
    id,
    description: 'Deletes the specified record from the specified table',
    schema: {
      input: schemaInput,
    },

    async handler(ctx) {
      // FIXME: remove the type assertion once backstage properly infers the type
      const input = ctx.input as z.infer<typeof schemaInput>;

      // Set the base path and credentials for the OpenAPI client
      OpenAPI.BASE = config.getString('servicenow.baseUrl');
      OpenAPI.USERNAME = config.getString('servicenow.username');
      OpenAPI.PASSWORD = config.getString('servicenow.password');

      try {
        await DefaultService.deleteApiNowTable(input);
      } catch (error) {
        throw new Error((error as ApiError).body.error.message);
      }
    },
  });
};
