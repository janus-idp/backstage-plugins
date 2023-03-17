import { type UseAutocompleteProps } from '@mui/material';
import { type FieldProps, type RJSFSchema } from '@rjsf/utils';

export type PickerFieldExtensionProps<T> = FieldProps<T, RJSFSchema, any> &
  Pick<
    UseAutocompleteProps<T, undefined, undefined, undefined>,
    'getOptionLabel' | 'options'
  >;
