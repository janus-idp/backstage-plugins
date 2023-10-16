import React from 'react';

import classNames from 'classnames';

import CamelCaseWrap from './CamelCaseWrap';

import './StatusIconAndText.css';

type StatusIconAndTextProps = {
  title: string;
  iconOnly?: boolean;
  className?: string;
  icon: React.ReactElement;
  spin?: boolean;
};

const DASH = '-';

export const StatusIconAndText = ({
  icon,
  title,
  spin,
  iconOnly,
  className,
}: StatusIconAndTextProps): React.ReactElement => {
  if (!title) {
    return <>{DASH}</>;
  }

  if (iconOnly) {
    return (
      <>
        {React.cloneElement(icon, {
          'data-testid': `icon-only-${title}`,
          className: icon.props.className,
        })}
      </>
    );
  }

  return (
    <span
      className={classNames('bs-shared-icon-and-text', className)}
      data-testid={`icon-with-title-${title}`}
      title={title}
    >
      {React.cloneElement(icon, {
        className: classNames(
          spin && 'fa-spin',
          icon.props.className,
          'bs-shared-icon-and-text__icon bs-shared-icon-flex-child',
        ),
      })}
      <CamelCaseWrap value={title} dataTest="status-text" />
    </span>
  );
};

export default StatusIconAndText;
