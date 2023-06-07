import React from 'react';

import './TopologyResourcesTabPanelItem.css';

type TopologyResourcesTabPanelItemProps = {
  resourceLabel: string;
  dataTest?: string;
};

const TopologyResourcesTabPanelItem = ({
  resourceLabel,
  children,
  dataTest,
}: React.PropsWithChildren<TopologyResourcesTabPanelItemProps>) => {
  const emptyState = (
    <span className="topology-text-muted">{`No ${resourceLabel} found for this resource.`}</span>
  );
  return (
    <>
      <h2 className="topology-resources-tab-item-title">{resourceLabel}</h2>
      <ul className="topology-resources-tab-item-list" data-testid={dataTest}>
        {children ? children : emptyState}
      </ul>
    </>
  );
};

export default TopologyResourcesTabPanelItem;
