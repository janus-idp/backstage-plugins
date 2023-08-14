import React from 'react';

import './TopologyResourcesTabPanelItem.css';

type TopologyResourcesTabPanelItemProps = {
  resourceLabel: string;
  dataTest?: string;
  showResCount?: number;
};

const TopologyResourcesTabPanelItem = ({
  resourceLabel,
  children,
  dataTest,
  showResCount,
}: React.PropsWithChildren<TopologyResourcesTabPanelItemProps>) => {
  const emptyState = (
    <span className="bs-topology-text-muted">{`No ${resourceLabel} found for this resource.`}</span>
  );
  return (
    <>
      <div className="bs-topology-resources-tab-item-title">
        <h2 className="bs-topology-resources-tab-item-label">
          {resourceLabel}
        </h2>
        {showResCount ? (
          <span
            className="bs-topology-text-muted"
            data-testid="res-show-count"
          >{`Showing latest ${showResCount} ${resourceLabel}`}</span>
        ) : null}
      </div>
      <ul
        className="bs-topology-resources-tab-item-list"
        data-testid={dataTest}
      >
        {children ? children : emptyState}
      </ul>
    </>
  );
};

export default TopologyResourcesTabPanelItem;
