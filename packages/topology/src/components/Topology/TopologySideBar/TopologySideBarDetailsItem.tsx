import React from 'react';

import './TopologySideBarDetailsItem.css';

type TopologySideBarDetailsItemProps = {
  label: string;
  emptyText?: string;
};

const TopologySideBarDetailsItem = ({
  label,
  children,
  emptyText,
}: React.PropsWithChildren<TopologySideBarDetailsItemProps>) => {
  return (
    <div className="topology-side-bar-details-item">
      <dt>{label}</dt>
      <dd>
        {children ? (
          children
        ) : (
          <span
            className="topology-text-muted"
            data-testid="detail-item-empty-state"
          >
            {emptyText}
          </span>
        )}
      </dd>
    </div>
  );
};

export default TopologySideBarDetailsItem;
