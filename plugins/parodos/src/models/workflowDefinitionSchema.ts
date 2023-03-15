import { z } from 'zod';

const parameterTypes = z.union([
  z.literal('PASSWORD'),
  z.literal('TEXT'),
  z.literal('EMAIL'),
  z.literal('DATE'),
  z.literal('NUMBER'),
  z.literal('MOCK-SELECT'),
  z.literal('URL'),
]);

const processingType = z.union([
  z.literal('SEQUENTIAL'),
  z.literal('PARALLEL'),
]);

export const workFlowTaskParameterTypeSchema = z.object({
  key: z.string(),
  description: z.string(),
  optional: z.boolean(),
  type: parameterTypes,
  options: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

export const baseWorkSchema = z.object({
  id: z.string(),
  name: z.string(),
  parameters: z.array(workFlowTaskParameterTypeSchema),
  workType: z.string(), // TODO: could this be a union?
  processingType: processingType.optional(),
  outputs: z
    .array(
      z.union([
        z.literal('EXCEPTION'),
        z.literal('HTTP2XX'),
        z.literal('NO_EXCEPTION'),
        z.literal('OTHER'),
      ]),
    )
    .optional(),
});

export type WorkType = z.infer<typeof baseWorkSchema> & {
  works?: WorkType[];
};

export const workSchema: z.ZodType<WorkType> = baseWorkSchema.extend({
  works: z.lazy(() => workSchema.array()).optional(),
});

export const workflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  processingType,
  author: z.string().optional().nullable(),
  description: z.string().optional(),
  createDate: z.string(),
  modifyDate: z.string(),
  works: z.array(workSchema),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export type WorkFlowTaskParameter = z.infer<
  typeof workFlowTaskParameterTypeSchema
>;

export type WorkFlowTaskParameterType = WorkFlowTaskParameter['type'];
