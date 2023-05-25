import { Badge } from '@patternfly/react-core';
import classNames from 'classnames';
import React from 'react';

import './ResourceStatus.css';

type ResourceStatusProps = {
  additionalClassNames?: string;
  badgeAlt?: boolean;
  noStatusBackground?: boolean;
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
const ResourceStatus = ({
  additionalClassNames,
  badgeAlt,
  children,
  noStatusBackground,
}: React.PropsWithChildren<ResourceStatusProps>) => {
  return (
    <span
      className={classNames(
        'bs-topology-resource-status',
        additionalClassNames,
      )}
    >
      <Badge
        className={classNames('bs-topology-resource-status__badge', {
          'bs-topology-resource-status__badge--alt': badgeAlt,
          'bs-topology-resource-status--BackgroundColor': noStatusBackground,
        })}
        isRead
        data-test="resource-status"
      >
        {children}
      </Badge>
    </span>
  );
};

export default ResourceStatus;
