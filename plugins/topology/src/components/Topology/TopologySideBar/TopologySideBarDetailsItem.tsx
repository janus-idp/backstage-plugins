import * as React from 'react';

import './TopologySideBarDetailsItem.css';

const TopologySideBarDetailsItem: React.FC<{
  label: string;
}> = ({ label, children }) => {
  return (
    <div className="topology-side-bar-details-item">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
};

export default TopologySideBarDetailsItem;
