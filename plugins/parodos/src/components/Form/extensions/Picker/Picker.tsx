import React, { useCallback } from 'react';
import { type PickerFieldExtensionProps } from './types';
import {
  Autocomplete,
  FormControl,
  TextField,
  type UseAutocompleteProps,
} from '@mui/material';

type AutoCompleteProps<T> = UseAutocompleteProps<T, boolean, boolean, boolean>;

export function PickerField<T>(props: PickerFieldExtensionProps<T>) {
  const {
    onChange,
    schema: { title = 'Entity', description = 'An entity from the catalog' },
    required,
    // uiSchema,
    rawErrors,
    formData,
    options,
    loading,
    getOptionLabel,
  } = props;

  const onSelect: AutoCompleteProps<T>['onChange'] = useCallback(
    (_, value) => {
      // eslint-disable-next-line no-console
      console.log(value);
      onChange(value);
    },
    [onChange],
  );

  return (
    <FormControl
      margin="none"
      required={required}
      error={(rawErrors ?? []).length > 0 && !formData}
    >
      <Autocomplete
        loading={loading}
        onChange={onSelect}
        options={options}
        autoSelect
        getOptionLabel={
          getOptionLabel as AutoCompleteProps<T>['getOptionLabel']
        }
        renderInput={params => (
          <TextField
            {...params}
            label={title}
            margin="none"
            helperText={description}
            FormHelperTextProps={{ style: { marginLeft: 0 } }}
            variant="outlined"
            required={required}
            InputProps={params.InputProps}
          />
        )}
      />
    </FormControl>
  );
}
