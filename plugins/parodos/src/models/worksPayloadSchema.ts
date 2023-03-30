import { z } from 'zod';

const argument = z.object({
  key: z.string(),
  value: z.string().nullable(),
});

export const baseWorkSchema = z.object({
  type: z.union([z.literal('TASK'), z.literal('WORKFLOW')]),
  workName: z.string(),
  arguments: z.array(argument),
});

type Work = z.infer<typeof baseWorkSchema> & {
  works?: Work[];
};

export const workSchema: z.ZodType<Work, z.ZodTypeDef> = baseWorkSchema.extend({
  works: z.lazy(() => workSchema.array()).optional(),
});

export const workflowsPayloadSchema = z.object({
  projectId: z.string(),
  workFlowName: z.string(),
  arguments: z.array(argument),
  works: z.array(workSchema),
});

export type WorkflowsPayload = z.infer<typeof workflowsPayloadSchema>;
