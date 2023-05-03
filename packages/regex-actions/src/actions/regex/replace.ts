import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import yaml from 'yaml';

const schemaInput = z.object({
  regExps: z.array(
    z.object({
      pattern: z
        .string()
        .refine(
          // You should not parse a regex (regular language) with a regex (regular language),
          // you actually need a context free grammar to parse a regex (regular language).
          // Hence, we are using a string comparison here.
          value =>
            !(
              value.charAt(0) === '/' && value.charAt(value.length - 1) === '/'
            ),
          {
            message:
              'The RegExp constructor cannot take a string pattern with a leading and trailing forward slash.',
          },
        )
        .describe(
          'The regex pattern to match the value like in String.prototype.replace()',
        ),
      flags: z
        .set(
          z.enum(['g', 'm', 'i', 'y', 'u', 's', 'd'], {
            invalid_type_error:
              'Invalid flag, possible values are: g, m, i, y, u, s, d',
          }),
        )
        .optional()
        .describe('The flags for the regex'),
      replacement: z
        .string()
        .describe(
          'The replacement value for the regex like in String.prototype.replace()',
        ),
      values: z.array(
        z.object({
          key: z.string().describe('The key to access the regex value'),
          value: z.string().describe('The input value of the regex'),
        }),
      ),
    }),
  ),
});

export type SchemaInput = z.infer<typeof schemaInput>;

const exampleValue =
  'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';

const id = 'regex:replace';

const examples = [
  {
    description: 'Create a regex to capture the first word of a string',
    example: yaml.stringify({
      steps: [
        {
          id: 'regexValues',
          action: id,
          name: 'Regex Values',
          input: {
            regExps: [
              {
                pattern: '^(\\S+).*$',
                replacement: '$1',
                values: [
                  { key: 'eg1', value: 'Hello world!' },
                  { key: 'eg2', value: 'Test world!' },
                ],
              },
            ],
          },
        },
      ],
    }),
  },
  {
    description: 'Create a regex to replace a word in a string',
    example: yaml.stringify({
      steps: [
        {
          id: 'regexValues',
          action: id,
          name: 'Regex Values',
          input: {
            regExps: [
              {
                pattern: 'dog',
                replacement: 'monkey',
                values: [
                  {
                    key: 'eg1',
                    value: exampleValue,
                  },
                ],
              },
              {
                pattern: 'Dog',
                replacement: 'ferret',
                flags: ['i'],
                values: [
                  {
                    key: 'eg2',
                    value: exampleValue,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  },
  {
    description: 'Create a regex to replace a word globally in a string',
    example: yaml.stringify({
      steps: [
        {
          id: 'regexValues',
          action: id,
          name: 'Regex Values',
          input: {
            regExps: [
              {
                pattern: 'dog',
                replacement: 'monkey',
                flags: ['g'],
                values: [
                  {
                    key: 'eg1',
                    value: exampleValue,
                  },
                ],
              },
              {
                pattern: 'Dog',
                replacement: 'ferret',
                flags: ['gi'],
                values: [
                  {
                    key: 'eg2',
                    value: exampleValue,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  },
];

export const createReplaceAction = () => {
  return createTemplateAction({
    id,
    description:
      'Replaces strings that match a regular expression pattern with a specified replacement string',
    examples,
    schema: {
      input: schemaInput as any,
    },

    async handler(ctx) {
      const input = ctx.input as SchemaInput;

      const values = {} as Record<string, string>;

      for (const {
        pattern,
        flags: flagsInput,
        replacement,
        values: valuesInput,
      } of input.regExps) {
        const flags = flagsInput ? Array.from(flagsInput).join('') : '';
        const regex = new RegExp(pattern, flags);

        for (const { key, value } of valuesInput) {
          const match = value.replace(regex, replacement);

          if (values.hasOwnProperty(key)) {
            throw new Error(
              `The key '${key}' is used more than once in the input.`,
            );
          }

          values[key] = match;
        }
      }

      ctx.output('values', values);
    },
  });
};
