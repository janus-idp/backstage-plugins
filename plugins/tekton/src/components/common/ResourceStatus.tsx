import React from 'react';

import { Badge } from '@patternfly/react-core';
import classNames from 'classnames';

import './ResourceStatus.css';

type ResourceStatusProps = {
  additionalClassNames?: string;
  badgeAlt?: boolean;
};

/**
 * Component for displaying resource status badge.
 * Use this component to display status of given resource.
 * It accepts child element to be rendered inside the badge.
 * @component ResourceStatus
 * @example
 * ```ts
 * return (
 *  <ResourceStatus additionalClassNames="hidden-xs">
 *    <Status status={resourceStatus} />
 *  </ResourceStatus>
 * )
 * ```
 */
export const ResourceStatus = ({
  additionalClassNames,
  badgeAlt,
  children,
}: React.PropsWithChildren<ResourceStatusProps>) => {
  return (
    <span className={classNames('bs-tkn-resource-status', additionalClassNames)}>
      <Badge
        className={classNames('bs-tkn-resource-status__badge', {
          'bs-tkn-resource-status__badge--alt': badgeAlt,
        })}
        isRead
        data-test="resource-status"
      >
        {children}
      </Badge>
    </span>
  );
};
