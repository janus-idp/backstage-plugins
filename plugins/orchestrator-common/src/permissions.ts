import { createPermission } from '@backstage/plugin-permission-common';

export const orchestratorWorkflowPermission = createPermission({
  name: 'orchestrator.workflow',
  attributes: {
    action: 'read',
  },
});

export const orchestratorWorkflowSpecificPermission = (workflowId: string) =>
  createPermission({
    name: `orchestrator.workflow.${workflowId}`,
    attributes: {
      action: 'read',
    },
  });

export const orchestratorWorkflowUsePermission = createPermission({
  name: 'orchestrator.workflow.use',
  attributes: {},
});

export const orchestratorWorkflowUseSpecificPermission = (workflowId: string) =>
  createPermission({
    name: `orchestrator.workflow.use.${workflowId}`,
    attributes: {},
  });

export const orchestratorPermissions = [orchestratorWorkflowPermission];
