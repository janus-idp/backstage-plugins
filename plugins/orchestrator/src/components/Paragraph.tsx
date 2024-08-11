import React, { PropsWithChildren } from 'react';

import { Typography } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';

export const Paragraph = (
  props: PropsWithChildren<{ variant?: Variant | 'inherit' }>,
) => {
  return (
    <Typography
      style={{ marginTop: '14px', marginBottom: '14px' }}
      variant={props.variant ?? 'body2'}
      component="p"
    >
      {props.children}
    </Typography>
  );
};
