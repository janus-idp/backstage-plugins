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
import { CreateActionOptions, ServiceNowResponses } from '../../../types';

/**
 * Schema for the input to the `retrieveRecords` action.
 *
 * @see {@link https://docs.servicenow.com/bundle/vancouver-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html#title_table-GET}
 */
const schemaInput = z.object({
  tableName: z
    .string()
    .nonempty()
    .describe('	Name of the table from which to retrieve the records'),
  sysparamQuery: z
    .string()
    .optional()
    .describe('An encoded query string used to filter the results'),
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
  sysparmSuppressPaginationHeader: z
    .boolean()
    .optional()
    .describe('True to suppress pagination header (default: false)'),
  sysparmFields: z
    .array(z.string().nonempty())
    .optional()
    .describe('A comma-separated list of fields to return in the response'),
  sysparmLimit: z
    .number()
    .optional()
    .describe(
      'The maximum number of results returned per page (default: 10,000)',
    ),
  sysparmView: z
    .string()
    .optional()
    .describe(
      'Render the response according to the specified UI view (overridden by sysparm_fields)',
    ),
  sysparmQueryCategory: z
    .string()
    .optional()
    .describe(
      'Name of the query category (read replica category) to use for queries',
    ),
  sysparmQueryNoDomain: z
    .boolean()
    .optional()
    .describe(
      'True to access data across domains if authorized (default: false)',
    ),
  sysparm_no_count: z
    .boolean()
    .optional()
    .describe('Do not execute a select count(*) on table (default: false)'),
});

const id = 'servicenow:now:table:retrieveRecords';

export const retrieveRecordsAction = (
  options: CreateActionOptions,
): TemplateAction => {
  const { config } = options;

  return createTemplateAction({
    id,
    description: 'Retrieves multiple records for the specified table',
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

      let res: ServiceNowResponses['200'];
      try {
        res = (await DefaultService.getApiNowTable({
          ...input,
          sysparmFields: input.sysparmFields?.join(','),
        })) as ServiceNowResponses['200'];
      } catch (error) {
        throw new Error((error as ApiError).body.error.message);
      }

      ctx.output('result', res?.result);
    },
  });
};
