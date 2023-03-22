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
  key: 'newProject',
  type: 'BOOLEAN',
  optional: true,
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

  if (newProject) {
    cloned.works[0].parameters?.unshift({
      key: 'Name',
      description: 'New Project',
      optional: false,
      type: 'TEXT',
    });

    cloned.works[0].parameters?.unshift(newProjectChoice);
  } else {
    cloned.works[0].parameters = [];

    cloned.works[0].parameters?.unshift({
      key: 'project',
      optional: false,
      type: 'TEXT',
      field: 'ProjectPicker',
      disabled: !hasProjects,
    });

    cloned.works[0].parameters?.unshift({
      ...newProjectChoice,
      description: 'Search for an existing project to execute a new workflow:',
    });
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

  return formSchema;
}
