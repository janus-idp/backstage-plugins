import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import { ASSESSMENT_WORKFLOW } from './constants';
import type { WorkflowDefinition, WorkFlowTaskParameter } from '../../models/workflowDefinitionSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import set from 'lodash.set';

interface Props {
  hasProjects: boolean;
  newProject: boolean;
}


const newProjectChoice: WorkFlowTaskParameter = {
  key: 'newProject',
  description: 'Is this a new assessment for this project?',
  type: 'BOOLEAN',
  optional: true,
  default: true
};

export function useGetProjectAssessmentSchema({
  hasProjects,
  newProject,
}: Props): FormSchema {
  const definition = useStore(state =>
    state.getWorkDefinitionBy('byName', ASSESSMENT_WORKFLOW),
  );

  
  let formSchema: FormSchema;
  
  const cloned = JSON.parse(JSON.stringify(definition)) as WorkflowDefinition;

  if(newProject) {
    cloned.works[0].parameters?.unshift({
      key: 'Name',
      description: 'New Project',
      optional: false,
      type: 'TEXT',
    });

    cloned.works[0].parameters?.push(newProjectChoice);

    formSchema = jsonSchemaFromWorkflowDefinition(cloned);
  } else {
    cloned.works[0].parameters = [newProjectChoice];

    cloned.works[0].parameters?.push({
      key: 'Name',
      description: 'Project Name',
      optional: false,
      type: 'TEXT',
      field: 'ProjectPicker',
      disabled: !hasProjects
    });

    formSchema = jsonSchemaFromWorkflowDefinition(cloned);
  }

  return formSchema;
}
