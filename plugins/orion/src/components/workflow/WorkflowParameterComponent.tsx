import React from 'react';
import { TextField } from '@material-ui/core';
import { DatePicker } from '@patternfly/react-core';
import { WorkFlowTaskParameterType } from '../types';

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

  // eslint-disable-next-line no-console
  console.log('Unknown parameter type: ', param);
  return null;
};
