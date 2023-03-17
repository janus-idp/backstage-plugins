import {z} from 'zod';

const status = z.union([
  z.literal('COMPLETED'),
  z.literal('IN_PROGRESS'),
  z.literal('PENDING'),
  z.literal('FAILED'),
]);

export const workflowTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  status,
  runAfterTasks: z.array(z.string()),
  locked: z.boolean(),
});


export const baseWorkStatusSchema = z.object({
  name: z.string(),
  type: z.union([
    z.literal('TASK'),
    z.literal('WORKFLOW'),
  ]),
  status,
  locked: z.boolean().optional().nullable()
});

export type WorkStatus = z.infer<typeof baseWorkStatusSchema> & {
  works?: WorkStatus[];
};

export const workStatusSchema: z.ZodType<WorkStatus> = baseWorkStatusSchema.extend({
  works: z.lazy(() => workStatusSchema.array()).optional(),
});

export const workflowStatusSchema = z.object({
  workFlowExecutionId: z.string(),
  workFlowName: z.string(),
  works: z.array(workStatusSchema),
});

export type WorkflowTask = z.infer<typeof workflowTaskSchema>;

export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;