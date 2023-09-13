import React from 'react';

import { Icon } from '@patternfly/react-core';
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

export const GreenCheckCircleIcon = ({
  className,
  title,
  size,
}: ColoredIconProps) => (
  <Icon
    size={size}
    title={title}
    className={classNames('bs-topology-icons__green-check-icon', className)}
  >
    <CheckCircleIcon data-test="success-icon" />
  </Icon>
);

export const RedExclamationCircleIcon = ({
  className,
  title,
  size,
}: ColoredIconProps) => (
  <Icon
    size={size}
    title={title}
    className={classNames('bs-topology-icons__red-exclamation-icon', className)}
  >
    <ExclamationCircleIcon />
  </Icon>
);
