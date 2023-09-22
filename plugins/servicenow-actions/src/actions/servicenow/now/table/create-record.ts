import type { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import type { JsonObject } from '@backstage/types';

import { z } from 'zod';

import { DefaultService, OpenAPI } from '../../../../generated/now/table';

const schemaInput = z.object({
  tableName: z.string().nonempty(),
  // The request body is dependent on the table you are creating a record in
  requestBody: z.custom<JsonObject>().optional(),
  // Return field display values (true), actual values (false), or both (all) (default: false)
  sysparm_display_value: z.enum(['true', 'false', 'all']).optional(),
  // True to exclude Table API links for reference fields (default: false)
  sysparm_exclude_reference_link: z.boolean().optional(),
  // A comma-separated list of fields to return in the response
  sysparm_fields: z.array(z.string().nonempty()).optional(),
  // Set field values using their display value (true) or actual value (false) (default: false)
  sysparm_input_display_value: z.boolean().optional(),
  // True to suppress auto generation of system fields (default: false)
  sysparm_suppress_auto_sys_field: z.boolean().optional(),
  // Render the response according to the specified UI view (overridden by sysparm_fields)
  sysparm_view: z.string().optional(),
});

const id = 'servicenow:now:table:createRecord';

export type CreateRecordActionOptions = {
  config: Config;
};

export const createRecordAction = (options: CreateRecordActionOptions) => {
  const { config } = options;

  return createTemplateAction({
    id,
    description:
      'Allows you to perform create, read, update and delete (CRUD) operations on existing tables',
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

      const { result } = (await DefaultService.postApiNowTable(input)) as {
        result: JsonObject;
      };

      ctx.output('result', result);
    },
  });
};
