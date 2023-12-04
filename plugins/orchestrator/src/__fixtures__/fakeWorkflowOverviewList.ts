import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeWorkflowOverviewList: WorkflowOverview[] = [
  {
    workflowId: 'quarkus-backend-workflow-ci-switch',
    name: '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
    uri: 'quarkus-backend-workflow-ci-switch.sw.yaml',
    lastTriggeredMs: 0,
    description:
      '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  },
  {
    workflowId: 'orchestrator-ansible-job-long-timeout',
    name: '[WF] Ansible Job with Jira and Timeout',
    uri: 'orchestrator-ansible-job-long-timeout.sw.yaml',
    lastTriggeredMs: 0,
    description:
      '[WF] Launch an Ansible Job within Ansible Automation Platform with Jira integration and Timeout',
  },
  {
    workflowId: 'orchestrator-ansible-job-parallel-error-handler',
    name: '[WF] Ansible Job - Parallel/Error',
    uri: 'orchestrator-ansible-job-parallel-error-handler.sw.yaml',
    lastTriggeredMs: 0,
    description:
      '[WF] Launch an Ansible Job within Ansible Automation Platform - Error Handling',
  },
  {
    workflowId: 'orchestrator-ansible-job-long',
    name: '[WF] Ansible Job with Jira',
    uri: 'orchestrator-ansible-job-long.sw.yaml',
    lastTriggeredMs: 0,
    description:
      '[WF] Launch an Ansible Job within Ansible Automation Platform with Jira integration',
  },
  {
    workflowId: 'orchestrator-ansible-job',
    name: '[WF] Ansible Job',
    uri: 'orchestrator-ansible-job.sw.yaml',
    lastTriggeredMs: 0,
    description:
      '[WF] Launch an Ansible Job within Ansible Automation Platform',
  },
  {
    workflowId: 'quarkus-backend-workflow-extended',
    name: '[WF] Create a Quarkus Backend application with a CI pipeline - Extended',
    uri: 'quarkus-backend-workflow-extended.sw.yaml',
    lastTriggeredMs: 0,
    description:
      '[WF] Create a starter Quarkus Backend application with a CI pipeline - Extended',
  },
  {
    workflowId: 'workflow_actions',
    name: 'Workflow name',
    uri: 'workflow_actions.sw.yaml',
    lastTriggeredMs: 0,
    description: 'Workflow description',
  },
  {
    workflowId: 'yamlgreet',
    name: 'Greeting workflow',
    uri: 'yamlgreet.sw.yaml',
    lastTriggeredMs: 0,
    description: 'YAML based greeting workflow',
  },
  {
    workflowId: 'jira',
    name: '[WF] Jira',
    uri: 'jira.sw.json',
    lastTriggeredMs: 0,
    description: '[WF] Jira issue',
  },
];
