import React from 'react';
import { Templates } from '@rjsf/mui';
import { FieldTemplateProps } from '@rjsf/utils';

const FieldTemplate: any = Templates.FieldTemplate;

export function FluidFieldTemplate(props: FieldTemplateProps): JSX.Element {
  return (
    <div style={{ border: '10px solid green' }}>
      {/* <Grid container spacing={3} style={{ border: '10px solid green' }}> */}
      <FieldTemplate {...props} />
      {/* </Grid> */}
    </div>
  );
}
