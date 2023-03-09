import React from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import { DatePicker } from '@patternfly/react-core';
import { WorkFlowTaskParameterType } from '../../components/types';
import { Select, SelectedItems, SelectItem } from '@backstage/core-components';
import { WorkflowParametersContext } from '../context/WorkflowParametersContext';
import { getParamValidator, ValidationType } from './validators';

const useStyles = makeStyles({
  validationError: {
    color: 'red',
  },
});

const ValidationError: React.FC<{ validation: ValidationType }> = ({
  validation,
}) => {
  const styles = useStyles();
  return <div className={styles.validationError}>{validation}</div>;
};

export const WorkflowParameterComponent: React.FC<{
  param: WorkFlowTaskParameterType;
}> = ({ param }) => {
  const { getParamValue, setParamValue, getParamValidation } = React.useContext(
    WorkflowParametersContext,
  );

  const validation = getParamValidation(param.key);

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
        helperText={
          validation ? (
            <ValidationError validation={validation} />
          ) : (
            param.description
          )
        }
        label={param.key}
        required={!param.optional}
        type={type}
        value={getParamValue(param.key)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setParamValue(
            param.key,
            event.target.value,
            getParamValidator(param),
          );
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
        helperText={
          validation ? (
            <ValidationError validation={validation} />
          ) : (
            param.description
          )
        }
        value={getParamValue(param.key)}
        onChange={(_, value: string) => {
          setParamValue(param.key, value, getParamValidator(param));
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
          setParamValue(param.key, value as string, getParamValidator(param));
        }}
        label={param.key}
        // TODO: required={!param.optional}
        // TODO: helperText={param.description}
        // TODO: show validation
        items={items}
        selected={getParamValue(param.key)}
      />
    );
  }

  // eslint-disable-next-line no-console
  console.log('Unknown parameter type: ', param);
  return null;
};
