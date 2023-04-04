import React from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Templates } from '@rjsf/material-ui-v5';
import { assert } from 'assert-ts';

export function OutlinedBaseInputTemplate(props: WidgetProps) {
  const { BaseInputTemplate } = Templates;

  assert(!!BaseInputTemplate);

  return <BaseInputTemplate {...props} variant="outlined" />;
}
