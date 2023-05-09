import React from 'react';

import './TopologySideBarDetailsItem.css';

const TopologySideBarDetailsItem: React.FC<{
  label: string;
  emptyText?: string;
}> = ({ label, children, emptyText }) => {
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
