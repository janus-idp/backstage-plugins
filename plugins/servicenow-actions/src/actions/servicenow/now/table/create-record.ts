import {
  createTemplateAction,
  type TemplateAction,
} from '@backstage/plugin-scaffolder-node';

import yaml from 'yaml';
import { z } from 'zod';

import {
  ApiError,
  DefaultService,
  OpenAPI,
} from '../../../../generated/now/table';
import { CreateActionOptions, ServiceNowResponses } from '../../../types';

/**
 * Schema for the input to the `createRecord` action.
 *
 * @see {@link https://developer.servicenow.com/dev.do#!/reference/api/vancouver/rest/c_TableAPI}
 */
const schemaInput = z.object({
  tableName: z
    .string()
    .nonempty()
    .describe('Name of the table in which to save the record'),
  requestBody: z
    .custom<Record<PropertyKey, unknown>>()
    .optional()
    .describe(
      'Field name and the associated value for each parameter to define in the specified record',
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
    .describe('An array of fields to return in the response'),
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
});

const id = 'servicenow:now:table:createRecord';

const examples = [
  {
    description: 'Create a record in the incident table',
    example: yaml.stringify({
      steps: [
        {
          id: 'createRecord',
          action: id,
          name: 'Create Record',
          input: {
            tableName: 'incident',
            requestBody: {
              short_description: 'Test incident',
              description: 'This is a test incident',
              severity: '3',
            },
          },
        },
      ],
    }),
  },
];

export const createRecordAction = (
  options: CreateActionOptions,
): TemplateAction => {
  const { config } = options;

  return createTemplateAction({
    id,
    examples,
    description:
      'Inserts one record in the specified table. Multiple record insertion is not supported by this method',
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

      let res: ServiceNowResponses['201'];
      try {
        res = (await DefaultService.postApiNowTable({
          ...input,
          // convert the array of fields to a comma-separated string
          sysparmFields: input.sysparmFields?.join(','),
        })) as ServiceNowResponses['201'];
      } catch (error) {
        throw new Error((error as ApiError).body.error.message);
      }

      ctx.output('result', res.result);
    },
  });
};
