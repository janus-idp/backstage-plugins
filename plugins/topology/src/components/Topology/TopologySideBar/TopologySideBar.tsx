import {
  BaseNode,
  TopologySideBar as PFTopologySideBar,
} from '@patternfly/react-topology';
import * as React from 'react';
import TopologySideBarContent from './TopologySideBarContent';

import './TopologySideBar.css';

type TopologySideBarProps = {
  node: BaseNode;
  onClose: () => void;
};

const TopologySideBar = ({ onClose, node }: TopologySideBarProps) => {
  return (
    <PFTopologySideBar resizable onClose={onClose}>
      <div className="pf-topology-side-bar__body">
        <TopologySideBarContent node={node} />
      </div>
    </PFTopologySideBar>
  );
};

export default TopologySideBar;
