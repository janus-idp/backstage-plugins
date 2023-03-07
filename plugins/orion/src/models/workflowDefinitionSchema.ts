import { z } from 'zod';

export const workFlowTaskParameterTypeSchema = z.object({
  key: z.string(),
  description: z.string(),
  optional: z.boolean(),
  type: z.union([
    z.literal('PASSWORD'),
    z.literal('TEXT'),
    z.literal('EMAIL'),
    z.literal('DATE'),
    z.literal('NUMBER'),
    z.literal('MOCK-SELECT'),
    z.literal('URL'),
  ]),
  options: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

export const workflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().optional(),
  description: z.string().optional(),
  createDate: z.string(),
  modifyDate: z.string(),
  type: z.string(),
  tasks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      parameters: z.array(workFlowTaskParameterTypeSchema),
      outputs: z.array(
        z.union([
          z.literal('EXCEPTION'),
          z.literal('HTTP2XX'),
          z.literal('NO_EXCEPTION'),
          z.literal('OTHER'),
        ]),
      ),
      workFlowChecker: z.string().optional(),
      nextWorkFlow: z.string().optional(),
    }),
  ),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export type WorkFlowTaskParameter = z.infer<
  typeof workFlowTaskParameterTypeSchema
>;

export type WorkFlowTaskParameterType = WorkFlowTaskParameter['type'];
