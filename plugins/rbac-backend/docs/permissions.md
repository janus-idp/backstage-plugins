# Example permissions within Showcase / RHDH

Note: The requirements section primarily pertains to the frontend and may not be strictly necessary for the backend.

When defining a permission for the RBAC Backend plugin to consume, follow these guidelines:

- Permission policies defined using the name of the permission will have higher priority over permission policies that are defined using the resource type.

  - Example:

    ```CSV
    p, role:default/myrole, catalog-entity, read, allow
    p, role:default/myrole, catalog.entity.read, read, deny
    g, user:default/myuser, role:default/myrole
    ```

  Where 'myuser' will have a deny for reading catalog entities, because the permission name takes priority over the permission resource type.

- If the permission does not have a policy associated with it, use the keyword `use` in its place.
  - Example: `p, role:default/test, kubernetes.proxy, use, allow`

## Catalog

| Name                    | Resource Type  | Policy | Description                                             | Requirements            |
| ----------------------- | -------------- | ------ | ------------------------------------------------------- | ----------------------- |
| catalog.entity.read     | catalog-entity | read   | Allows the user to read from the catalog                | X                       |
| catalog.entity.create   |                | create | Allows the user to create catalog entities              | catalog.location.create |
| catalog.entity.refresh  | catalog-entity | update | Allows the user to refresh one or more catalog entities | catalog.entity.read     |
| catalog.entity.delete   | catalog-entity | delete | Allows the user to delete one or more catalog entities  | catalog.entity.read     |
| catalog.location.read   |                | read   | Allows the user to read one or more catalog locations   | catalog.entity.read     |
| catalog.location.create |                | create | Allows the user to create one or more catalog locations | catalog.entity.create   |
| catalog.location.delete |                | delete | Allows the user to delete one or more catalog locations | catalog.entity.delete   |

## Jenkins

| Name            | Resource Type  | Policy | Description                                                | Requirements        |
| --------------- | -------------- | ------ | ---------------------------------------------------------- | ------------------- |
| jenkins.execute | catalog-entity | update | Allows the user to execute an action in the Jenkins plugin | catalog.entity.read |

## Kubernetes

| Name             | Resource Type | Policy | Description                                                                                                 | Requirements        |
| ---------------- | ------------- | ------ | ----------------------------------------------------------------------------------------------------------- | ------------------- |
| kubernetes.proxy |               |        | Allows the user to access the proxy endpoint (ability to read pod logs and events within Showcase and RHDH) | catalog.entity.read |

## RBAC

| Name                 | Resource Type | Policy | Description                                           | Requirements |
| -------------------- | ------------- | ------ | ----------------------------------------------------- | ------------ |
| policy.entity.read   | policy-entity | read   | Allows the user to read permission policies / roles   | X            |
| policy.entity.create | policy-entity | create | Allows the user to create permission policies / roles | X            |
| policy.entity.update | policy-entity | update | Allow the user to update permission policies / roles  | X            |
| policy.entity.delete | policy-entity | delete | Allow the user to delete permission policies / roles  | X            |

## Scaffolder

| Name                               | Resource Type       | Policy | Description                                       | Requirements                                                      |
| ---------------------------------- | ------------------- | ------ | ------------------------------------------------- | ----------------------------------------------------------------- |
| scaffolder.action.execute          | scaffolder-action   |        | Allows the execution of an action from a template | scaffolder.template.parameter.read, scaffolder.template.step.read |
| scaffolder.template.parameter.read | scaffolder-template | read   | Allows the user to read parameters of a template  | scaffolder.template.step.read                                     |
| scaffolder.template.step.read      | scaffolder-template | read   | Allows the user to read steps of a template       | scaffolder.template.paramater.read                                |

## OCM

| Name             | Resource Type | Policy | Description                                                       | Requirements |
| ---------------- | ------------- | ------ | ----------------------------------------------------------------- | ------------ |
| ocm.entity.read  |               | read   | Allows the user to read from the ocm plugin                       | X            |
| ocm.cluster.read |               | read   | Allows the user to read the cluster information in the ocm plugin | X            |
