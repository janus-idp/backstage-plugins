import { z } from 'zod';

const parameterTypes = z.union([
  z.literal('string'),
  z.literal('number'),
  z.literal('boolean'),
]);

const parameterFormat = z.union([
  z.literal('password'),
  z.literal('text'),
  z.literal('email'),
  z.literal('date'),
  z.literal('number'),
  z.literal('url'),
  z.literal('boolean'),
]);

const processingType = z.union([
  z.literal('SEQUENTIAL'),
  z.literal('PARALLEL'),
]);

export const workFlowTaskParameterTypeSchema = z.object({
  description: z.string().optional(),
  required: z.string().transform(val => val === 'true'),
  type: parameterTypes,
  format: parameterFormat.optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  default: z.any().optional(),
  field: z.string().optional(),
  disabled: z.boolean().default(false).optional(),
});

type Parameter = z.infer<typeof workFlowTaskParameterTypeSchema>;

type InputParameter = {
  [K in keyof Parameter]: K extends 'required' ? string : Parameter[K];
};

export const baseWorkSchema = z.object({
  id: z.string(),
  name: z.string(),
  parameters: z
    .record(z.string(), workFlowTaskParameterTypeSchema)
    .optional()
    .nullable(),
  workType: z.union([z.literal('TASK'), z.literal('WORKFLOW')]),
  processingType: processingType.optional(),
  author: z.string().optional().nullable(),
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

export type WorkTypeInput = {
  [K in keyof WorkType]: K extends 'parameters'
    ? Record<string, InputParameter> | null
    : K extends 'works'
    ? WorkTypeInput[]
    : WorkType[K];
};

export const workSchema: z.ZodType<WorkType, z.ZodTypeDef, WorkTypeInput> =
  baseWorkSchema.extend({
    works: z.lazy(() => workSchema.array()).optional(),
  });

export const workflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  processingType,
  author: z.string().optional().nullable(),
  createDate: z.string(),
  modifyDate: z.string(),
  parameters: z
    .record(z.string(), workFlowTaskParameterTypeSchema)
    .optional()
    .nullable(),
  works: z.array(workSchema),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export type WorkFlowTaskParameter = z.infer<
  typeof workFlowTaskParameterTypeSchema
>;

export type WorkFlowTaskParameterType = WorkFlowTaskParameter['type'];

export type ParameterFormat = WorkFlowTaskParameter['format'];
