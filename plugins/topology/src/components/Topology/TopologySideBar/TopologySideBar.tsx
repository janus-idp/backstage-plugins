import React from 'react';
import {
  BaseNode,
  TopologySideBar as PFTopologySideBar,
} from '@patternfly/react-topology';
import TopologySideBarContent from './TopologySideBarContent';

import './TopologySideBar.css';

type TopologySideBarProps = {
  node: BaseNode;
  onClose: () => void;
};

const TopologySideBar: React.FC<TopologySideBarProps> = ({ onClose, node }) => {
  return (
    <PFTopologySideBar resizable onClose={onClose}>
      <div className="pf-topology-side-bar__body">
        <TopologySideBarContent node={node} />
      </div>
    </PFTopologySideBar>
  );
};

export default TopologySideBar;
