export * from './service/router';
export * from './service/policy-builder';

// To provide backward compatibility with client code implemented
// before PluginIdProvider was moved to @janus-idp/backstage-plugin-rbac-node.
export type { PluginIdProvider } from '@janus-idp/backstage-plugin-rbac-node';

export { rbacPlugin as default } from './plugin';
