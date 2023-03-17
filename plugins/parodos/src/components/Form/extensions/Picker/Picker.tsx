import React, { useCallback } from 'react';
import { type PickerFieldExtensionProps } from './types';
import {
  Autocomplete,
  FormControl,
  TextField,
  type UseAutocompleteProps,
} from '@mui/material';

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

  const onSelect: UseAutocompleteProps<
    T,
    boolean,
    boolean,
    boolean
  >['onChange'] = useCallback(
    (_, value) => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <FormControl
      margin="normal"
      required={required}
      error={(rawErrors ?? []).length > 0 && !formData}
    >
      <Autocomplete
        loading={loading}
        onChange={onSelect}
        options={options}
        autoSelect
        getOptionLabel={getOptionLabel}
        renderInput={params => (
          <TextField
            {...params}
            label={title}
            margin="dense"
            helperText={description}
            FormHelperTextProps={{ margin: 'dense', style: { marginLeft: 0 } }}
            variant="outlined"
            required={required}
            InputProps={params.InputProps}
          />
        )}
      />
    </FormControl>
  );
}
