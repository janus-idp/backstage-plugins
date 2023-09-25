import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import type { JsonObject } from '@backstage/types';

import { z } from 'zod';

import { DefaultService, OpenAPI } from '../../../../generated/now/table';
import { CreateActionOptions } from '../../../types';

/**
 * Schema for the input to the `deleteRecord` action.
 *
 * @see https://docs.servicenow.com/bundle/vancouver-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html#title_table-DELETE
 *
 * @param {string} tableName - Name of the table in which to delete the record.
 * @param {string} sysId - Unique identifier of the record to delete.
 * @param {boolean} sysparmQueryNoDomain - True to access data across domains if authorized (default: false)
 */
const schemaInput = z.object({
  tableName: z.string().nonempty(),
  sysId: z.string().nonempty(),
  sysparmQueryNoDomain: z.boolean().optional(),
});

const id = 'servicenow:now:table:deleteRecord';

export const deleteRecordAction = (options: CreateActionOptions) => {
  const { config } = options;

  return createTemplateAction({
    id,
    description: 'Deletes the specified record from the specified table.',
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

      const { result } = (await DefaultService.deleteApiNowTable(input)) as {
        result: JsonObject;
      };

      ctx.output('result', result);
    },
  });
};
