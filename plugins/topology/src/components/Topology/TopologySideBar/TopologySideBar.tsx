import * as React from 'react';
import {
  BaseNode,
  TopologySideBar as PFTopologySideBar,
} from '@patternfly/react-topology';
import TopologySideBarContent from './TopologySideBarContent';

type TopologySideBarProps = {
  node: BaseNode;
  onClose: () => void;
};

const TopologySideBar: React.FC<TopologySideBarProps> = ({ onClose, node }) => {
  return (
    <PFTopologySideBar
      resizable
      className="pf-topology-side-bar-resizable"
      onClose={onClose}
    >
      <div className="pf-topology-side-bar__body">
        <TopologySideBarContent node={node} />
      </div>
    </PFTopologySideBar>
  );
};

export default TopologySideBar;
