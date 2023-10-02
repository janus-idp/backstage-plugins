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
import { CreateActionOptions } from '../../../types';

/**
 * Schema for the input to the `deleteRecord` action.
 *
 * @see {@link https://developer.servicenow.com/dev.do#!/reference/api/vancouver/rest/c_TableAPI}
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

const examples = [
  {
    description: 'Delete a record from the incident table',
    example: yaml.stringify({
      steps: [
        {
          id: 'deleteRecord',
          action: id,
          input: {
            tableName: 'incident',
            sysId: '8e67d33b97d1b5108686b680f053af2b',
          },
        },
      ],
    }),
  },
];

export const deleteRecordAction = (
  options: CreateActionOptions,
): TemplateAction => {
  const { config } = options;

  return createTemplateAction({
    id,
    examples,
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
