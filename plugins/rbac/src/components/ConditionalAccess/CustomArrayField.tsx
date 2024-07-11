import React from 'react';

import { makeStyles, TextField, Typography } from '@material-ui/core';
import { getDefaultRegistry } from '@rjsf/core';
import { FieldProps } from '@rjsf/utils';
import { getInnerSchemaForArrayItem } from '@rjsf/utils/lib/schema/getDefaultFormState';

const useStyles = makeStyles(theme => ({
  arrayFieldDescription: {
    marginTop: '5px',
    fontWeight: 500,
    color: `${theme.palette.grey[500]} !important`,
  },
}));

export const CustomArrayField = (props: FieldProps) => {
  const { name, required, schema: sch, formData, onChange } = props;
  const classes = useStyles();
  const [fieldVal, setFieldVal] = React.useState<string>(
    formData?.toString() ?? '',
  );

  const arrayItemsType = getInnerSchemaForArrayItem(sch).type;

  const DefaultArrayField = getDefaultRegistry().fields.ArrayField;

  return arrayItemsType === 'string' ? (
    <>
      <TextField
        name={name}
        variant="outlined"
        label={name}
        value={fieldVal}
        onChange={e => {
          const value = e.target.value;
          setFieldVal(value);
          onChange(value ? value.split(',').map(val => val.trim()) : []);
        }}
        required={required}
        placeholder="string, string"
      />
      <Typography variant="caption">
        <Typography
          variant="subtitle2"
          className={classes.arrayFieldDescription}
        >
          {sch.description ?? ''}
        </Typography>
      </Typography>
    </>
  ) : (
    <DefaultArrayField {...props} />
  );
};
