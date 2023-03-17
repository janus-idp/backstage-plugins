import React from 'react';
import { useStore } from '../../../../stores/workflowStore/workflowStore';
import { PickerField, PickerFieldExtensionProps } from '../Picker';
import type { Project } from '../../../../models/project';

type ProjectPickerProps = PickerFieldExtensionProps<Project>;

export function ProjectPicker(props: ProjectPickerProps): JSX.Element {
  const projects = useStore(state => state.projects);

  console.log('here!!!!!')

  return (
    <PickerField<Project>
      {...props}
      schema={{
        title: 'New roject',
        description: 'New Project',
      }}
      options={projects}
      getOptionLabel={option => option.name}
      defaultValue=""
      multiple
    />
  );
}

export const ProjectPickerField = {
  ProjectPicker,
};
