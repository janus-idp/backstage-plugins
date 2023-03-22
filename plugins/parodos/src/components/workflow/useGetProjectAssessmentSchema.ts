import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import { ASSESSMENT_WORKFLOW } from './constants';
import type {
  WorkflowDefinition,
  WorkFlowTaskParameter,
} from '../../models/workflowDefinitionSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import set from 'lodash.set';

interface Props {
  hasProjects: boolean;
  newProject: boolean;
}

const newProjectChoice: WorkFlowTaskParameter = {
  type: 'boolean',
  required: true,
  default: true,
};

export function useGetProjectAssessmentSchema({
  hasProjects,
  newProject,
}: Props): FormSchema {
  const definition = useStore(state =>
    state.getWorkDefinitionBy('byName', ASSESSMENT_WORKFLOW),
  );

  const cloned = JSON.parse(JSON.stringify(definition)) as WorkflowDefinition;

  cloned.works[0].parameters = cloned.works[0].parameters ?? {};

  if (newProject) {
    cloned.works[0].parameters.Name = {
      description: 'New Project',
      required: false,
      format: 'text',
      type: 'string',
    };

    cloned.works[0].parameters.newProject = { ...newProjectChoice };
  } else {
    cloned.works[0].parameters.project = {
      required: false,
      type: 'string',
      format: 'text',
      field: 'ProjectPicker',
      disabled: !hasProjects,
    };

    cloned.works[0].parameters.newProject = {
      ...newProjectChoice,
      description: 'Search for an existing project to execute a new workflow:',
    };
  }

  const formSchema = jsonSchemaFromWorkflowDefinition(cloned);

  // TODO: should be able to do this with ui:title
  set(
    formSchema,
    `steps[0].schema.properties.onboardingAssessmentTask.properties.newProject.title`,
    'Is this a new assessment for this project?',
  );

  if (!hasProjects) {
    set(
      formSchema,
      `steps[0].uiSchema.onboardingAssessmentTask.newProject.['ui:disabled']`,
      true,
    );
  }

  set(
    formSchema,
    `steps[0].uiSchema.onboardingAssessmentTask.newProject.['ui:xs']`,
    12,
  );

  return formSchema;
}
