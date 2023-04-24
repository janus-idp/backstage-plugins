import * as React from 'react';
import classNames from 'classnames';
import CamelCaseWrap from './CamelCaseWrap';

import './StatusIconAndText.css';

type StatusIconAndTextProps = {
  title?: string;
  icon?: React.ReactElement;
};

const DASH = '-';

/**
 * Component for displaying a status icon and text
 * @param {React.ReactElement} [icon] - (optional) icon to be displayed
 * @example
 * ```tsx
 * <StatusIconAndText icon={renderIcon} />
 * ```
 */
const StatusIconAndText: React.FC<StatusIconAndTextProps> = ({
  icon,
  title,
}) => {
  if (!title) {
    return <>{DASH}</>;
  }
  return (
    <span className="bs-topology-icon-and-text" title={title}>
      {icon &&
        React.cloneElement(icon, {
          className: classNames(
            icon.props.className,
            'bs-topology-icon-and-text__icon bs-topology-icon-flex-child',
          ),
        })}
      <CamelCaseWrap value={title} dataTest="status-text" />
    </span>
  );
};

export default StatusIconAndText;
