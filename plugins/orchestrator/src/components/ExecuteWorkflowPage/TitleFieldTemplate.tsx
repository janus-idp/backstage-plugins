import React from 'react';

import { Grid, Typography } from '@material-ui/core';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  TitleFieldProps,
} from '@rjsf/utils';

export const TitleFieldTemplate = <
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(
  props: TitleFieldProps<T, S, F>,
) => {
  const { id, title } = props;

  return (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      style={{ marginTop: '8px' }}
    >
      <Grid item>
        <SubdirectoryArrowRightIcon />
      </Grid>
      <Grid item>
        <Typography
          id={id}
          variant="body1"
          style={{ fontWeight: 500, fontSize: '16px' }}
        >
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
};
