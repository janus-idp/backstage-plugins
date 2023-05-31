import React from 'react';

import { Divider } from '@material-ui/core';
import { BaseNode } from '@patternfly/react-topology';

import TopologySideBarBody from './TopologySideBarBody';
import TopologySideBarHeading from './TopologySideBarHeading';

import './TopologySideBarContent.css';

type TopologySideBarContentProps = { node: BaseNode };

const TopologySideBarContent = ({ node }: TopologySideBarContentProps) => {
  return (
    <div className="topology-side-bar-content">
      <TopologySideBarHeading resource={node.getData().resource} />
      <Divider />
      <TopologySideBarBody node={node} />
    </div>
  );
};

export default TopologySideBarContent;
