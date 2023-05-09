import React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import classNames from 'classnames';

import './icons.css';

export type ColoredIconProps = {
  className?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export const GreenCheckCircleIcon: React.FC<ColoredIconProps> = ({
  className,
  title,
  size,
}) => (
  <CheckCircleIcon
    data-test="success-icon"
    size={size}
    className={classNames('bs-topology-icons__green-check-icon', className)}
    title={title}
  />
);

export const RedExclamationCircleIcon: React.FC<ColoredIconProps> = ({
  className,
  title,
  size,
}) => (
  <ExclamationCircleIcon
    size={size}
    className={classNames('bs-topology-icons__red-exclamation-icon', className)}
    title={title}
  />
);
