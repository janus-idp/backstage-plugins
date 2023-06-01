import React from 'react';

import { Divider, Tab, Tabs } from '@material-ui/core';
import { BaseNode } from '@patternfly/react-topology';

import TopologyDetailsTabPanel from './TopologyDetailsTabPanel';
import TopologyResourcesTabPanel from './TopologyResourcesTabPanel';

import './TopologySideBarBody.css';

interface TabPanelProps {
  index: number;
  value: number;
}

const TabPanel = (props: React.PropsWithChildren<TabPanelProps>) => {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <div className="topology-side-bar-tab-panel">{children}</div>}
    </div>
  );
};

type TopologySideBarBodyProps = { node: BaseNode };

const TopologySideBarBody = ({ node }: TopologySideBarBodyProps) => {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <div className="topology-side-bar-tabs">
        <Tabs value={value} onChange={handleChange} indicatorColor="primary">
          <Tab label="Details" className="tab-button" />
          <Tab label="Resources" className="tab-button" />
        </Tabs>
        <Divider />
      </div>
      <TabPanel value={value} index={0}>
        <TopologyDetailsTabPanel node={node} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TopologyResourcesTabPanel node={node} />
      </TabPanel>
    </div>
  );
};

export default TopologySideBarBody;
