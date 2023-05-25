import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import classNames from 'classnames';
import React from 'react';

import './icons.css';

export type ColoredIconProps = {
  className?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export const GreenCheckCircleIcon = ({
  className,
  title,
  size,
}: ColoredIconProps) => (
  <CheckCircleIcon
    data-test="success-icon"
    size={size}
    className={classNames('bs-topology-icons__green-check-icon', className)}
    title={title}
  />
);

export const RedExclamationCircleIcon = ({
  className,
  title,
  size,
}: ColoredIconProps) => (
  <ExclamationCircleIcon
    size={size}
    className={classNames('bs-topology-icons__red-exclamation-icon', className)}
    title={title}
  />
);
