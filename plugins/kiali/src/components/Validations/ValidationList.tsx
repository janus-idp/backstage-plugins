import React from 'react';

import { Tooltip } from '@material-ui/core';

import { ObjectCheck, ValidationTypes } from '../../types/IstioObjects';
import { highestSeverity } from '../../types/ServiceInfo';
import { Validation } from './Validation';

type ValidationListProps = {
  checks?: ObjectCheck[];
  tooltipPosition?: string;
};

export const ValidationList: React.FC<ValidationListProps> = (
  props: ValidationListProps,
) => {
  const content = (props.checks ?? []).map((check, index) => {
    return (
      <Validation
        key={`validation-check-${index}`}
        severity={check.severity}
        message={`${check.code ? `${check.code} ` : ''}${check.message}`}
      />
    );
  });

  const severity = highestSeverity(props.checks ?? []);
  const isValid = severity === ValidationTypes.Correct;

  const tooltip = (
    <Tooltip title={isValid ? 'Valid' : content}>
      <span>
        <Validation severity={severity} />
      </span>
    </Tooltip>
  );

  return tooltip;
};
