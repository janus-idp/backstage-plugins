import React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import classNames from 'classnames';

import './icons.css';

export type ColoredIconProps = {
  className?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

/**
 * Component for displaying a green check mark circle icon
 * @param {string} [className] - (optional) additional class name for the component
 * @param {string} [title] - (optional) icon title
 * @param {string} [size] - (optional) icon size: ('sm', 'md', 'lg', 'xl')
 * @example
 * ```tsx
 * <GreenCheckCircleIcon title="Healthy" />
 * ```
 */
export const GreenCheckCircleIcon = ({ className, title, size }: ColoredIconProps) => (
  <CheckCircleIcon
    data-test="success-icon"
    size={size}
    className={classNames('icons__green-check-icon', className)}
    title={title}
  />
);

/**
 * Component for displaying a red exclamation mark circle icon
 * @param {string} [className] - (optional) additional class name for the component
 * @param {string} [title] - (optional) icon title
 * @param {string} [size] - (optional) icon size: ('sm', 'md', 'lg', 'xl')
 * @example
 * ```tsx
 * <RedExclamationCircleIcon title="Failed" />
 * ```
 */
export const RedExclamationCircleIcon = ({ className, title, size }: ColoredIconProps) => (
  <ExclamationCircleIcon
    size={size}
    className={classNames('icons__red-exclamation-icon', className)}
    title={title}
  />
);

/**
 * Component for displaying a yellow triangle exclamation icon
 * @param {string} [className] - (optional) additional class name for the component
 * @param {string} [title] - (optional) icon title
 * @param {string} [size] - (optional) icon size: ('sm', 'md', 'lg', 'xl')
 * @example
 * ```tsx
 * <YellowExclamationTriangleIcon title="Warning" />
 * ```
 */
export const YellowExclamationTriangleIcon = ({ className, title, size }: ColoredIconProps) => (
  <ExclamationTriangleIcon
    size={size}
    className={classNames('icons__yellow-exclamation-icon', className)}
    title={title}
  />
);

/**
 * Component for displaying a blue info circle icon
 * @param {string} [className] - (optional) additional class name for the component
 * @param {string} [title] - (optional) icon title
 * @param {string} [size] - (optional) icon size: ('sm', 'md', 'lg', 'xl')
 * @example
 * ```tsx
 * <BlueInfoCircleIcon title="Info" />
 * ```
 */
export const BlueInfoCircleIcon = ({ className, title }: ColoredIconProps) => (
  <InfoCircleIcon className={classNames('icons__blue-info-icon', className)} title={title} />
);
