import { createPermission } from '@backstage/plugin-permission-common';

export const orchestratorWorkflowInstancesReadPermission = createPermission({
  name: 'orchestrator.workflowInstances.read',
  attributes: {
    action: 'read',
  },
});

export const orchestratorWorkflowInstanceReadPermission = createPermission({
  name: 'orchestrator.workflowInstance.read',
  attributes: {
    action: 'read',
  },
});

export const orchestratorWorkflowReadPermission = createPermission({
  name: 'orchestrator.workflow.read',
  attributes: {
    action: 'read',
  },
});

export const orchestratorWorkflowExecutePermission = createPermission({
  name: 'orchestrator.workflows',
  attributes: {},
});

export const orchestratorPermissions = [
  orchestratorWorkflowReadPermission,
  orchestratorWorkflowExecutePermission,
  orchestratorWorkflowInstancesReadPermission,
  orchestratorWorkflowInstanceReadPermission,
];
