import React from 'react';
import { TextField } from '@material-ui/core';
import { DatePicker } from '@patternfly/react-core';
import { WorkFlowTaskParameterType } from '../types';
import { Select, SelectedItems, SelectItem } from '@backstage/core-components';

export const WorkflowParameterComponent: React.FC<{
  param: WorkFlowTaskParameterType;
}> = ({ param }) => {
  if (['TEXT', 'PASSWORD', 'EMAIL', 'URL', 'NUMBER'].includes(param.type)) {
    let type: string;
    switch (param.type) {
      case 'PASSWORD':
        type = 'password';
        break;
      case 'EMAIL':
        type = 'email';
        break;
      case 'URL':
        type = 'url';
        break;
      case 'NUMBER':
        type = 'number';
        break;
      default:
        type = 'text';
    }

    return (
      <TextField
        id={param.key}
        helperText={param.description}
        label={param.key}
        required={!param.optional}
        type={type}
        onChange={() => {
          // TODO: add validation
          // TODO: store the value in the state
        }}
        variant="outlined"
      />
    );
  }

  if (param.type === 'DATE') {
    return (
      <DatePicker
        label={param.key}
        required={!param.optional}
        helperText={param.description}
        onChange={() => {
          // TODO: add validation
          // TODO: store the value in the state
        }}
      />
    );
  }

  if (param.type === 'MOCK-SELECT') {
    const items: SelectItem[] = (param.options || []).map(opt => ({
      label: opt.key,
      value: opt.value,
    }));

    return (
      <Select
        onChange={(selected: SelectedItems) => {
          console.log('selected', selected);
        }}
        label={param.key}
        // required={!param.optional}
        // helperText={param.description}
        items={items}
        selected={undefined /* value */}
      />
    );
  }

  // eslint-disable-next-line no-console
  console.log('Unknown parameter type: ', param);
  return null;
};
