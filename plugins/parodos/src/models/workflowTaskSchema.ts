import { z } from 'zod';

export const workflowTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.union([
    z.literal('COMPLETED'),
    z.literal('IN_PROGRESS'),
    z.literal('PENDING'),
    z.literal('FAILED'),
  ]),
  runAfterTasks: z.array(z.string()),
  locked: z.boolean(),
});

export type WorkflowTask = z.infer<typeof workflowTaskSchema>;
