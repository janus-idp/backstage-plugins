import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import type { JsonObject } from '@backstage/types';

import { z } from 'zod';

import { DefaultService, OpenAPI } from '../../../../generated/now/table';
import { CreateActionOptions } from '../../../types';

/**
 * Schema for the input to the `modifyRecord` action.
 *
 * @see https://docs.servicenow.com/bundle/vancouver-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html#title_table-PUT
 *
 * @param {string} tableName - Name of the table in which to modify the record.
 * @param {string} sysId - Unique identifier of the record to modify.
 * @param {JsonObject} requestBody - Field name and the associated value for each parameter to define in the specified record.
 * @param {string} sysparmDisplayValue - Return field display values (true), actual values (false), or both (all) (default: false)
 * @param {boolean} sysparmExcludeReferenceLink - True to exclude Table API links for reference fields (default: false)
 * @param {string[]} sysparmFields - A comma-separated list of fields to return in the response
 * @param {boolean} sysparmInputDisplayValue - Set field values using their display value (true) or actual value (false) (default: false)
 * @param {boolean} sysparmSuppressAutoSysField - True to suppress auto generation of system fields (default: false)
 * @param {string} sysparmView - Render the response according to the specified UI view (overridden by sysparm_fields)
 * @param {boolean} sysparmQueryNoDomain - True to access data across domains if authorized (default: false)
 */
const schemaInput = z.object({
  tableName: z.string().nonempty(),
  sysId: z.string().nonempty(),
  requestBody: z.custom<JsonObject>().optional(),
  sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional(),
  sysparmExcludeReferenceLink: z.boolean().optional(),
  sysparmFields: z.array(z.string().nonempty()).optional(),
  sysparmInputDisplayValue: z.boolean().optional(),
  sysparmSuppressAutoSysField: z.boolean().optional(),
  sysparmView: z.string().optional(),
  sysparmQueryNoDomain: z.boolean().optional(),
});

const id = 'servicenow:now:table:modifyRecord';

export const modifyRecordAction = (options: CreateActionOptions) => {
  const { config } = options;

  return createTemplateAction({
    id,
    description: 'Updates the specified record with the request body.',
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

      const { result } = (await DefaultService.putApiNowTable({
        ...input,
        sysparmFields: input.sysparmFields?.join(','),
      })) as {
        result: JsonObject;
      };

      ctx.output('result', result);
    },
  });
};
