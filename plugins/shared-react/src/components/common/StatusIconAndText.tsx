import React from 'react';

import classNames from 'classnames';

import CamelCaseWrap from './CamelCaseWrap';

import './StatusIconAndText.css';

type StatusIconAndTextProps = {
  title?: string;
  iconOnly?: boolean;
  noTooltip?: boolean;
  className?: string;
  popoverTitle?: string;
  icon?: React.ReactElement;
  spin?: boolean;
};

const DASH = '-';

export const StatusIconAndText = ({
  icon,
  title,
  spin,
  iconOnly,
  noTooltip,
  className,
}: StatusIconAndTextProps) => {
  if (!title) {
    return <>{DASH}</>;
  }

  return (
    <span
      className={classNames('bs-shared-icon-and-text', className)}
      title={iconOnly && !noTooltip ? title : undefined}
    >
      {icon &&
        React.cloneElement(icon, {
          className: classNames(
            spin && 'fa-spin',
            icon.props.className,
            !iconOnly &&
              'bs-shared-icon-and-text__icon bs-shared-icon-flex-child',
          ),
        })}
      {!iconOnly && <CamelCaseWrap value={title} dataTest="status-text" />}
    </span>
  );
};

export default StatusIconAndText;
