import React, { CSSProperties } from 'react';

import { Typography } from '@material-ui/core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

import { kialiStyle } from '../../styles/StyleUtils';
import { ValidationTypes } from '../../types/IstioObjects';
import { PFColors } from '../Pf/PfColors';

const validationStyle = kialiStyle({
  textAlign: 'left',
  $nest: {
    '&:last-child p': {
      margin: 0,
    },
  },
});

type Props = ValidationDescription & {
  messageColor?: boolean;
  size?: string;
  textStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
};

export type ValidationDescription = {
  severity: ValidationTypes;
  message?: string;
};

export type ValidationType = {
  name: string;
  color: string;
  icon: React.ComponentClass<SVGIconProps>;
};

const ErrorValidation: ValidationType = {
  name: 'Not Valid',
  color: PFColors.Danger,
  icon: ExclamationCircleIcon,
};

const WarningValidation: ValidationType = {
  name: 'Warning',
  color: PFColors.Warning,
  icon: ExclamationTriangleIcon,
};

const InfoValidation: ValidationType = {
  name: 'Info',
  color: PFColors.Info,
  icon: InfoCircleIcon,
};

const CorrectValidation: ValidationType = {
  name: 'Valid',
  color: PFColors.Success,
  icon: CheckCircleIcon,
};

export const severityToValidation: { [severity: string]: ValidationType } = {
  error: ErrorValidation,
  warning: WarningValidation,
  correct: CorrectValidation,
  info: InfoValidation,
};

export const Validation = (props: Props) => {
  const validation = () => {
    return severityToValidation[props.severity];
  };

  const severityColor = () => {
    return { color: validation().color };
  };

  const textStyle = () => {
    const colorMessage = props.messageColor || false;
    const textStyleT = props.textStyle || {};
    if (colorMessage) {
      Object.assign(textStyleT, severityColor());
    }
    return textStyleT;
  };

  const iconStyle = () => {
    const iconStyleP = props.iconStyle ? { ...props.iconStyle } : {};
    const defaultStyle: CSSProperties = {
      verticalAlign: '-0.125em',
    };
    Object.assign(iconStyleP, severityColor());
    Object.assign(iconStyleP, defaultStyle);
    return iconStyleP;
  };

  const IconComponent = validation().icon;
  const hasMessage = !!props.message;
  if (hasMessage) {
    return (
      <div className={validationStyle}>
        <Typography variant="body2" style={textStyle()}>
          {' '}
          <IconComponent style={iconStyle()} /> {props.message}
        </Typography>
      </div>
    );
  }
  return <IconComponent style={iconStyle()} />;
};
