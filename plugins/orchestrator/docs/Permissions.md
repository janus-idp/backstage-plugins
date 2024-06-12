The Orchestrator plugin protects its backend endpoints with the builtin permission mechanism and combines it with
the RBAC plugin. The result is control over what users can see or execute.

## Orchestrator Permissions

| Name                                | Resource Type  | Policy | Description                                                       | Requirements |
| ----------------------------------- | -------------- | ------ | ----------------------------------------------------------------- | ------------ |
| orchestrator.workflowInstances.read | named resource | read   | Allows the user to read orchestrator workflows overview           |              |
| orchestrator.workflowInstance.read  | named resource | read   | Allows the user to read the details of a single workflow instance |              |
| orchestrator.workflowInstance.abort | named resource | use    | Allows the user to abort a workflow instance                      |              |
| orchestrator.workflow.read          | named resource | read   | Allows the user to read the workflow definitions                  |              |
| orchestrator.workflow.execute       | named resource | use    | Allows the user to execute a workflow                             |              |

## Policy File

To get started with policies, we recommend defining 2 roles and assigning them to groups or users.

See the example [policy file](./rbac-policy.csv)

```csv
p, role:default/workflowViewer, orchestrator.workflowInstances.read, read, allow
p, role:default/workflowViewer, orchestrator.workflowInstance.read, read, allow

p, role:default/workflowAdmin, orchestrator.workflow.read, read, allow
p, role:default/workflowAdmin, orchestrator.workflow.execute, use, allow
p, role:default/workflowAdmin, orchestrator.workflowInstance.abort, use, deny
p, role:default/workflowAdmin, orchestrator.workflowInstances.read, read, allow
p, role:default/workflowAdmin, orchestrator.workflowInstance.read, read, allow

g, user:default/guest, role:default/workflowViewer
g, user:default/myOrgUser, role:default/workflowAdmin
g, group:default/platformAdmins, role:default/worflowAdmin
```
