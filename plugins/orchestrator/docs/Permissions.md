The Orchestrator plugin protects its backend endpoints with the builtin permission mechanism and combines it with
the RBAC plugin. The result is control over what users can see or execute.

## Orchestrator Permissions

| Name                                      | Resource Type  | Policy | Description                                                                           | Requirements |
| ----------------------------------------- | -------------- | ------ | ------------------------------------------------------------------------------------- | ------------ |
| orchestrator.workflow.read                | named resource | read   | Allows the user to list and read _any_ workflow definition and their instances (runs) |              |
| orchestrator.workflow.read.[`workflowId`] | named resource | read   | Allows the user to list and read the details of a _single_ workflow definition        |              |
| orchestrator.workflow.use                 | named resource | read   | Allows the user to run or abort _any_ workflow                                        |              |
| orchestrator.workflow.use.[`workflowId`]  | named resource | read   | Allows the user to run or abort the _single_ workflow                                 |              |

The user is permitted to do an action if either the generic permission or the specific one allows it.
In other words, it is not possible to grant generic `orchestrator.workflowInstance.read` and then selectively disable it for a specific workflow via `orchestrator.workflow.use.[workflowId]` with `deny`.

## Policy File

To get started with policies, we recommend defining 2 roles and assigning them to groups or users.

As an example, mind the following [policy file](./rbac-policy.csv).

Since the `guest` user has the `default/workflowUser` role, it can:

- list subset of workflows (specific `orchestrator.workflow.yamlgreet`)
- view workflow details and their instances of selected workflow (`orchestrator.workflow.yamlgreet`)
- execute or abort the `yamlgreet` and `wait-or-error` workflows but not any other (`orchestrator.workflow.use.yamlgreet`)

Namely, the `default/workflowUser` role can not see the list of _all_ workflows or execute other workflows than explicitly stated.

The users of the `default/workflowAdmin` role have full permissions (can list, read and execute any workflow).

```csv
p, role:default/workflowUser, orchestrator.workflow.yamlgreet, read, allow
p, role:default/workflowUser, orchestrator.workflow.wait-or-error, read, allow

p, role:default/workflowUser, orchestrator.workflow.use.yamlgreet, use, allow

p, role:default/workflowAdmin, orchestrator.workflow, read, allow
p, role:default/workflowAdmin, orchestrator.workflow.use, use, allow

g, user:development/guest, role:default/workflowUser
g, user:default/mareklibra, role:default/workflowAdmin
```

See https://casbin.org/docs/rbac for more information about casbin rules.

## Enable permissions

To enable permissions, you need to add the following in the [app-config file](../../../app-config.yaml):

```
permission:
  enabled: true
  rbac:
    policies-csv-file: <absolute path to the policy file>
    policyFileReload: true
```
