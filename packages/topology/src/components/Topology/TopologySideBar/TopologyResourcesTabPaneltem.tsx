import * as React from 'react';

import './TopologyResourcesTabPanelItem.css';

const TopologyResourcesTabPanelItem: React.FC<{
  resourceLabel: string;
  dataTest?: string;
}> = ({ resourceLabel, children, dataTest }) => {
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
