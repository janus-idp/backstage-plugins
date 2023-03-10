import { z } from 'zod';

export const workflowOptionItem = z.object({
  identifier: z.string(),
  displayName: z.string(),
  description: z.string(),
  details: z.array(z.string()),
  workFlowName: z.string(),
});

export const workflowSchema = z.object({
  workFlowExecutionId: z.string(),
  workFlowOptions: z.object({
    currentVersion: workflowOptionItem.nullable(),
    upgradeOptions: z.array(workflowOptionItem),
    migrationOptions: z.array(workflowOptionItem),
    newOptions: z.array(workflowOptionItem),
    continuationOptions: z.array(workflowOptionItem),
    otherOptions: z.array(workflowOptionItem),
    optionsAvailable: z.boolean(),
  }),
});

export type Workflow = z.infer<typeof workflowSchema>;

export type WorkflowOptionItem = z.infer<typeof workflowOptionItem>;
