import React from 'react';
import { TextField } from '@material-ui/core';
import { DatePicker } from '@patternfly/react-core';
import { WorkFlowTaskParameterType } from '../types';
import { Select, SelectedItems, SelectItem } from '@backstage/core-components';
import { WorkflowParametersContext } from '../../context/WorkflowParametersContext';

export const WorkflowParameterComponent: React.FC<{
  param: WorkFlowTaskParameterType;
}> = ({ param }) => {
  const { getParamValue, setParamValue } = React.useContext(
    WorkflowParametersContext,
  );

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
        value={getParamValue(param.key)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          // TODO: add validation
          setParamValue(param.key, event.target.value);
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
        value={getParamValue(param.key)}
        onChange={(_, value: string) => {
          // TODO: add validation
          setParamValue(param.key, value);
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
          const value = Array.isArray(selected) ? selected[0] : selected;
          setParamValue(param.key, value as string);
        }}
        label={param.key}
        // required={!param.optional}
        // helperText={param.description}
        items={items}
        selected={getParamValue(param.key)}
      />
    );
  }

  // eslint-disable-next-line no-console
  console.log('Unknown parameter type: ', param);
  return null;
};
