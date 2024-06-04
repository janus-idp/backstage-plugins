# Audit logging

RBAC backend plugin supports audit logging with help of @janus-idp/backstage-plugin-audit-log-node library.
Audit logging helps to track the latest changes and events from RBAC plugin:

- RBAC role changes;
- RBAC permissions changes;
- RBAC conditions changes;
- changes caused modification of application configuration;
- changes caused modification of permission policy file;
- get requests for RBAC permission information;
- user authorize result to RBAC resources

RBAC backend plugin logging doesn't provide information about actual state of the permissions. Actual state RBAC permissions you can find in the RBAC UI. Audit logging provides information about event name, event message, RBAC permission changes, actor who made these changes, time, log level, stage, status, some part of the request, response and so on. You can use this information like history of the RBAC permission hierarchy.

Notice: RBAC permissions and conditions bounded to RBAC roles. But RBAC backend plugin logs information about permissions and conditions with help of separated log messages. That's because for now RBAC plugin has separated API for RBAC roles, RBAC permissions and RBAC conditions.

## Audit log actor

Audit log actor can be real REST API user or RBAC plugin itself. When actor is REST API user, then RBAC plugin logs user ip, browser agent and hostname.
RBAC plugin also can be actor of the events. In this case actor has a name: "rbac-backend". In this case plugin typically applies changes from configuration or permission policy file. Application configuration and permission policy file usually mounts to the application deployment with help of config maps. Unfortunately RBAC plugin can not track who originally made modification of these resources.
But you can enable Kubernetes API audit log: https://kubernetes.io/docs/tasks/debug/debug-cluster/audit. Then you can match RBAC plugin audit log events to the events from Kubernetes logs by time.

## Audit log format

RBAC plugin prints information to the backend log in the json format. Format of these messages defined in the @janus-idp/backstage-plugin-audit-log-node library.
Each audit log line contains key '"isAuditLog":true'.

You can change log level with help of environment variable: LOG_LEVEL.

Example logged RBAC events:

a) RBAC role created with corresponding basic permissions and conditional permission:

```json
backend:start: info: Created role:default/test {"actor":{"actorId":"user:default/advanced-user","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},"eventName":"CreateRole","isAuditLog":true,"meta":{"author":"user:default/advanced-user","createdAt":"Tue, 04 Jun 2024 12:14:12 GMT","description":"some test role","lastModified":"Tue, 04 Jun 2024 12:14:12 GMT","members":["user:default/logarifm","group:default/team-a"],"modifiedBy":"user:default/advanced-user","roleEntityRef":"role:default/test","source":"rest"},"plugin":"permission","request":{"body":{"memberReferences":["user:default/logarifm","group:default/team-a"],"metadata":{"description":"some test role"},"name":"role:default/test"},"method":"POST","params":{},"query":{},"url":"/api/permission/roles"},"response":{"status":201},"service":"backstage","stage":"sendResponse","status":"succeeded","timestamp":"2024-06-04 15:14:12"}

backend:start: info: Created permission policies {"actor":{"actorId":"user:default/advanced-user","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},"eventName":"CreatePolicy","isAuditLog":true,"meta":{"policies":[["role:default/test","scaffolder-template","read","allow"]],"source":"rest"},"plugin":"permission","request":{"body":[{"effect":"allow","entityReference":"role:default/test","permission":"scaffolder-template","policy":"read"}],"method":"POST","params":{},"query":{},"url":"/api/permission/policies"},"response":{"status":201},"service":"backstage","stage":"sendResponse","status":"succeeded","timestamp":"2024-06-04 15:14:12"}

backend:start: info: Created conditional permission policy {"actor":{"actorId":"user:default/advanced-user","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},"eventName":"CreateCondition","isAuditLog":true,"meta":{"condition":{"conditions":{"params":{"claims":["group:default/team-a"]},"resourceType":"catalog-entity","rule":"IS_ENTITY_OWNER"},"permissionMapping":[{"action":"read","name":"catalog.entity.read"},{"action":"delete","name":"catalog.entity.delete"},{"action":"update","name":"catalog.entity.refresh"}],"pluginId":"catalog","resourceType":"catalog-entity","result":"CONDITIONAL","roleEntityRef":"role:default/test"}},"plugin":"permission","request":{"body":{"conditions":{"params":{"claims":["group:default/team-a"]},"resourceType":"catalog-entity","rule":"IS_ENTITY_OWNER"},"permissionMapping":["read","delete","update"],"pluginId":"catalog","resourceType":"catalog-entity","result":"CONDITIONAL","roleEntityRef":"role:default/test"},"method":"POST","params":{},"query":{},"url":"/api/permission/roles/conditions"},"response":{"body":{"id":8},"status":201},"service":"backstage","stage":"sendResponse","status":"succeeded","timestamp":"2024-06-04 15:14:12"}
backend:start: info: ::1 - - [04/Jun/2024:12:14:12 +0000] "POST /api/permission/roles/conditions HTTP/1.1" 201 8 "http://localhost:3000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" {"service":"rootHttpRouter","timestamp":"2024-06-04 15:14:12","type":"incomingRequest"}
```

b) check access user to application resource:

```json
backend:start: info: Policy check for user:default/advanced-user {"actor":{"actorId":"user:default/advanced-user"},"eventName":"PermissionEvaluationStarted","isAuditLog":true,"meta":{"action":"read","permissionName":"policy.entity.read","resourceType":"policy-entity","userEntityRef":"user:default/advanced-user"},"plugin":"permission","service":"backstage","stage":"evaluatePermissionAccess","status":"succeeded","timestamp":"2024-06-04 15:24:33"}

backend:start: info: user:default/advanced-user is ALLOW for permission 'policy.entity.read', resource type 'policy-entity' and action 'read' {"actor":{"actorId":"user:default/advanced-user"},"eventName":"PermissionEvaluationCompleted","isAuditLog":true,"meta":{"action":"read","decision":{"result":"ALLOW"},"permissionName":"policy.entity.read","resourceType":"policy-entity","userEntityRef":"user:default/advanced-user"},"plugin":"permission","service":"backstage","stage":"evaluatePermissionAccess","status":"succeeded","timestamp":"2024-06-04 15:24:33"}
```

Most audit log lines contains metadata object. RBAC plugin put information about RBAC roles, permissions, conditions, authorize results to this metadata. Metadata types you can find in the RBAC plugin file audit-log/audit-logger.ts.

Notice: you need properly configure logger to see nested json objects in the audit log lines.
