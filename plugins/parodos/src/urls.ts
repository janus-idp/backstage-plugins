// Backstage proxy prefix, see app-config.yaml
const base = '/api/proxy/parodos';

// The Workflow service
export const Workflows = `${base}/workflows`;
export const Projects = `${base}/projects`;
export const WorkflowDefinitions = `${base}/workflowdefinitions`;

// The Notification service
export const Notifications = `${base}-notifications/notifications`;
