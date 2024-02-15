import React from 'react';

import { kialiStyle } from '../../styles/StyleUtils';
import { ObjectCheck, ValidationTypes } from '../../types/IstioObjects';
import { highestSeverity } from '../../types/ServiceInfo';
import { PFColors } from '../Pf/PfColors';
import { Validation } from './Validation';

type ValidationStackProps = {
  checks?: ObjectCheck[];
};

const colorStyle = kialiStyle({ color: PFColors.White });
const titleStyle = kialiStyle({ color: PFColors.White, fontWeight: 'bold' });

export const ValidationStack: React.FC<ValidationStackProps> = (
  props: ValidationStackProps,
) => {
  const validationList = (): React.ReactNode[] => {
    return (props.checks ?? []).map((check, index) => {
      return (
        <div className={colorStyle}>
          <Validation
            key={`validation-check-${index}`}
            severity={check.severity}
            message={`${check.code ? `${check.code} ` : ''}${check.message}`}
          />
        </div>
      );
    });
  };

  const severity = highestSeverity(props.checks ?? []);
  const isValid = severity === ValidationTypes.Correct;

  if (!isValid) {
    return (
      <div>
        <span className={titleStyle}>Istio validations</span>
        {validationList()}
      </div>
    );
  }
  return null;
};
