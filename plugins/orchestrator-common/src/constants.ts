import { SwfDefinition, WorkflowSample } from './types';

export const swf_service_ready_topic = 'kogito-swf-service-ready';

export const empty_definition: SwfDefinition = {
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

export const schemas_folder = 'schemas';
export const specs_folder = 'specs';

export const jira_open_api_file = 'jira-openapi.json';
export const jira_open_api_file_path = `${specs_folder}/${jira_open_api_file}`;

export const actions_open_api_file = 'actions-openapi.json';
export const actions_open_api_file_path = `${specs_folder}/${actions_open_api_file}`;

export const spec_files = [actions_open_api_file_path, jira_open_api_file_path];

export const workflow_title = 'Workflow';
export const workflow_title_plural = 'Workflows';
export const workflow_type = 'workflow';

export const workflow_json_sample: WorkflowSample = {
  id: 'jsongreet',
  url: 'https://raw.githubusercontent.com/kiegroup/kogito-examples/stable/serverless-workflow-examples/serverless-workflow-greeting-quarkus/src/main/resources/jsongreet.sw.json',
};

export const workflow_yaml_sample: WorkflowSample = {
  id: 'yamlgreet',
  url: 'https://raw.githubusercontent.com/kiegroup/kogito-examples/stable/serverless-workflow-examples/serverless-workflow-greeting-quarkus/src/main/resources/yamlgreet.sw.yml',
};
