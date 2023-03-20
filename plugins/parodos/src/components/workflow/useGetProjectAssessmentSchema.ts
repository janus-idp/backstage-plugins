import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import { ASSESSMENT_WORKFLOW } from './constants';
import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import set from 'lodash.set';

interface Props {
  hasProjects: boolean;
  newProject: boolean;
}

export function useGetProjectAssessmentSchema({
  hasProjects,
  newProject,
}: Props): FormSchema {
  const definition = useStore(state =>
    state.getWorkDefinitionBy('byName', ASSESSMENT_WORKFLOW),
  );

  const cloned = JSON.parse(JSON.stringify(definition)) as WorkflowDefinition;

  // TODO: this should be coming from the API
  cloned.works[0].parameters?.unshift({
    key: 'Name',
    description: newProject ? 'New Project' : '',
    optional: false,
    type: 'TEXT',
  });

  const formSchema = jsonSchemaFromWorkflowDefinition(cloned);

  if (newProject === false) {
    set(
      formSchema,
      `steps[0].uiSchema.onboardingAssessmentTask.Name.['ui:field']`,
      'ProjectPicker',
    );
  }

  set(
    formSchema,
    `steps[0].schema.properties.onboardingAssessmentTask.properties.newProject`,
    {
      title: 'Is this a new assessment for this project?',
      type: 'boolean',
      default: true,
    },
  );

  set(formSchema, `steps[0].uiSchema.onboardingAssessmentTask.newProject`, {
    'ui:widget': 'radio',
    'ui:disabled': !hasProjects,
  });

  return formSchema;
}
