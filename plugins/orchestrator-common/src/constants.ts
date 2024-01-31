import { WorkflowDefinition, WorkflowSample } from './types';

export const ORCHESTRATOR_SERVICE_READY_TOPIC = 'orchestrator-service-ready';

export const EMPTY_DEFINITION: WorkflowDefinition = {
  id: 'workflow_unique_identifier',
  version: '0.1',
  specVersion: '0.8',
  name: 'Workflow name',
  description: 'Workflow description',
  start: 'StartState',
  functions: [
    {
      name: 'uniqueFunctionName',
      operation: 'specs/actions-openapi.json#catalog:fetch',
    },
  ],
  states: [
    {
      name: 'StartState',
      type: 'operation',
      actions: [
        {
          name: 'uniqueActionName',
          functionRef: {
            refName: 'uniqueFunctionName',
            arguments: {
              entityRef: '.entityRef',
            },
          },
        },
      ],
      end: true,
    },
  ],
};

export const SCHEMAS_FOLDER = 'schemas';
export const SPECS_FOLDER = 'specs';

export const JIRA_OPEN_API_FILE = 'jira-openapi.json';
export const JIRA_OPEN_API_FILE_PATH = `${SPECS_FOLDER}/${JIRA_OPEN_API_FILE}`;

export const ACTIONS_OPEN_API_FILE = 'actions-openapi.json';
export const ACTIONS_OPEN_API_FILE_PATH = `${SPECS_FOLDER}/${ACTIONS_OPEN_API_FILE}`;

export const SPEC_FILES = [ACTIONS_OPEN_API_FILE_PATH, JIRA_OPEN_API_FILE_PATH];

export const WORKFLOW_TITLE = 'Workflow';
export const WORKFLOW_TITLE_PLURAL = 'Workflows';
export const WORKFLOW_TYPE = 'workflow';

export const WORKFLOW_JSON_SAMPLE: WorkflowSample = {
  id: 'jsongreet',
  url: 'https://raw.githubusercontent.com/kiegroup/kogito-examples/stable/serverless-workflow-examples/serverless-workflow-greeting-quarkus/src/main/resources/jsongreet.sw.json',
};

export const WORKFLOW_YAML_SAMPLE: WorkflowSample = {
  id: 'yamlgreet',
  url: 'https://raw.githubusercontent.com/kiegroup/kogito-examples/stable/serverless-workflow-examples/serverless-workflow-greeting-quarkus/src/main/resources/yamlgreet.sw.yml',
};

// Default values for the orchestrator plugin configuration
export const DEFAULT_SONATAFLOW_CONTAINER_IMAGE =
  'quay.io/kiegroup/kogito-swf-devmode-nightly:main-2024-01-08';
export const DEFAULT_SONATAFLOW_PERSISTANCE_PATH = '/home/kogito/persistence';
export const DEFAULT_CATALOG_OWNER = 'orchestrator';
export const DEFAULT_CATALOG_ENVIRONMENT = 'development';
export const DEFAULT_EDITOR_PATH = 'https://start.kubesmarts.org';
export const DEFAULT_SONATAFLOW_BASE_URL = 'http://localhost';

export const DEFAULT_WORKFLOWS_PATH = 'workflows';

export const ASSESSMENT_WORKFLOW_TYPE = 'workflow-type/assessment';
export const INFRASTRUCTURE_WORKFLOW_TYPE = 'workflow-type/infrastructure';

export const FEATURE_FLAG_DEVELOPER_MODE = 'developer-mode';
