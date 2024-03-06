import * as React from 'react';

import { ObjectValidation, ValidationTypes } from '../../types/IstioObjects';
import { ValidationSummary } from './ValidationSummary';

interface Props {
  id: string;
  validations: ObjectValidation[];
}

export const ValidationServiceSummary: React.FC<Props> = (props: Props) => {
  const numberOfChecks = (type: ValidationTypes): number => {
    let numCheck = 0;

    props.validations.forEach(validation => {
      if (validation.checks) {
        numCheck += validation.checks.filter(i => i.severity === type).length;
      }
    });

    return numCheck;
  };

  return (
    <ValidationSummary
      id={props.id}
      errors={numberOfChecks(ValidationTypes.Error)}
      warnings={numberOfChecks(ValidationTypes.Warning)}
      type="service"
    />
  );
};
