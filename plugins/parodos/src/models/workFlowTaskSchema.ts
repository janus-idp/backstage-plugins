import { z } from 'zod';

export const workFlowTaskSchema = z.object({
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

export type WorkFlowTask = z.infer<typeof workFlowTaskSchema>;
