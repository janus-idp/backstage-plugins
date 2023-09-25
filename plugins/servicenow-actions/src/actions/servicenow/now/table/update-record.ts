import {
  createTemplateAction,
  type TemplateAction,
} from '@backstage/plugin-scaffolder-node';

import { z } from 'zod';

import { DefaultService, OpenAPI } from '../../../../generated/now/table';
import { CreateActionOptions, ServiceNowResponse } from '../../../types';

/**
 * Schema for the input to the `updateRecord` action.
 *
 * @see {@link https://docs.servicenow.com/bundle/vancouver-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html#title_table-PATCH}
 */
const schemaInput = z.object({
  tableName: z
    .string()
    .nonempty()
    .describe('Name of the table in which to update the record.'),
  sysId: z
    .string()
    .nonempty()
    .describe('Unique identifier of the record to update.'),
  requestBody: z
    .custom<Record<PropertyKey, unknown>>()
    .optional()
    .describe(
      'Field name and the associated value for each parameter to define in the specified record.',
    ),
  sysparmDisplayValue: z
    .enum(['true', 'false', 'all'])
    .optional()
    .describe(
      'Return field display values (true), actual values (false), or both (all) (default: false)',
    ),
  sysparmExcludeReferenceLink: z
    .boolean()
    .optional()
    .describe(
      'True to exclude Table API links for reference fields (default: false)',
    ),
  sysparmFields: z
    .array(z.string().nonempty())
    .optional()
    .describe('A comma-separated list of fields to return in the response'),
  sysparmInputDisplayValue: z
    .boolean()
    .optional()
    .describe(
      'Set field values using their display value (true) or actual value (false) (default: false)',
    ),
  sysparmSuppressAutoSysField: z
    .boolean()
    .optional()
    .describe(
      'True to suppress auto generation of system fields (default: false)',
    ),
  sysparmView: z
    .string()
    .optional()
    .describe(
      'Render the response according to the specified UI view (overridden by sysparm_fields)',
    ),
  sysparmQueryNoDomain: z
    .boolean()
    .optional()
    .describe(
      'True to access data across domains if authorized (default: false)',
    ),
});

const id = 'servicenow:now:table:updateRecord';

export const updateRecordAction = (
  options: CreateActionOptions,
): TemplateAction => {
  const { config } = options;

  return createTemplateAction({
    id,
    description:
      'Updates the specified record with the name-value pairs included in the request body.',
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

      const { result } = (await DefaultService.patchApiNowTable({
        ...input,
        sysparmFields: input.sysparmFields?.join(','),
      })) as ServiceNowResponse;

      ctx.output('result', result);
    },
  });
};
