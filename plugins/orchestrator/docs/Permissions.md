The Orchestrator plugin protects its backend endpoints with the builtin permission mechanism and combines it with
the RBAC plugin. The result is control over what users can see or execute.

## Orchestrator Permissions

| Name                                               | Resource Type  | Policy | Description                                                                                                                   | Requirements |
| -------------------------------------------------- | -------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| orchestrator.workflowInstances.read                | named resource | read   | Allows the user to read **all of orchestrator workflow runs** (workflow instances)                                            |              |
| orchestrator.workflowInstance.read                 | named resource | read   | Allows the user to read the details of **any single** workflow instance                                                       |              |
| orchestrator.workflowInstance.read.[`workflowId`]  | named resource | read   | Allows the user to read the details of `workflowId`-workflow's instances (replace the `[workflowId]` by a single workflow ID) |              |
| orchestrator.workflowInstance.abort                | named resource | use    | Allows the user to abort any workflow instance                                                                                |              |
| orchestrator.workflowInstance.abort.[`workflowId`] | named resource | use    | Allows the user to abort a single workflow instance                                                                           |              |
| orchestrator.workflows.read                        | named resource | read   | Allows the user to read **all of workflows** (but not their instances)                                                        |              |
| orchestrator.workflow.read                         | named resource | read   | Allows the user to read the workflow definitions                                                                              |              |
| orchestrator.workflow.read.[`workflowId`]          | named resource | read   | Allows the user to read the details of a single workflow definition                                                           |              |
| orchestrator.workflow.execute                      | named resource | use    | Allows the user to execute a workflow                                                                                         |              |
| orchestrator.workflow.execute.[`workflowId`]       | named resource | use    | Allows the user to execute a single workflow                                                                                  |              |

The user is permitted to do an action if either the generic permission or the specific one allows it.
In other words, it is not possible to grant generic `orchestrator.workflowInstance.read` and then selectively disable it for a specific workflow via `orchestrator.workflowInstance.read.[workflowId]` with `deny`.

## Policy File

To get started with policies, we recommend defining 2 roles and assigning them to groups or users.

As an example, mind the following [policy file](./rbac-policy.csv).

Since the `guest` user has the `default/workflowViewer` role, it can:

- view the list of workflows (`orchestrator.workflows.read`)
- view any workflow details (`orchestrator.workflow.read`)
- view the list of all instances (`orchestrator.workflowInstances.read`)
- view any instance (`orchestrator.workflowInstance.read`)
- execute just the `yamlgreet` workflow but not any other (`orchestrator.workflow.execute.yamlgreet`)

The users of the `workflowAdmin` role have full permissions.

```csv
p, role:default/workflowViewer, orchestrator.workflows.read, read, allow
p, role:default/workflowViewer, orchestrator.workflow.read, read, allow
p, role:default/workflowViewer, orchestrator.workflowInstances.read, read, allow
p, role:default/workflowViewer, orchestrator.workflowInstance.read, read, allow

p, role:default/workflowViewer, orchestrator.workflow.execute.yamlgreet, use, allow

p, role:default/workflowAdmin, orchestrator.workflows.read, read, allow
p, role:default/workflowAdmin, orchestrator.workflow.read, read, allow
p, role:default/workflowAdmin, orchestrator.workflowInstance.abort, use, allow
p, role:default/workflowAdmin, orchestrator.workflowInstances.read, read, allow
p, role:default/workflowAdmin, orchestrator.workflowInstance.read, read, allow

p, role:default/workflowAdmin, orchestrator.workflow.execute, use, allow

g, user:default/guest, role:default/workflowViewer
g, user:default/myOrgUser, role:default/workflowAdmin
g, group:default/platformAdmins, role:default/worflowAdmin
```

See https://casbin.org/docs/rbac for more information about casbin rules

## Enable permissions

To enable permissions, you need to add the following in the [app-config file](../../../app-config.yaml):

```
permission:
  enabled: true
  rbac:
    policies-csv-file: <absolute path to the policy file>
    policyFileReload: true
```
