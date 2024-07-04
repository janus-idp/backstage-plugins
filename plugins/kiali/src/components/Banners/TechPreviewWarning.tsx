import * as React from 'react';

import { Alert } from '@material-ui/lab';

type defaultProps = {
  message?: string;
};

export const TechPreviewWarning = (props: defaultProps) => {
  const msg = props.message ? props.message : 'This is a tech preview feature';
  return (
    <div style={{ display: 'inline' }}>
      <Alert severity="warning" id="default_dismissable">
        {msg}{' '}
      </Alert>
    </div>
  );
};
