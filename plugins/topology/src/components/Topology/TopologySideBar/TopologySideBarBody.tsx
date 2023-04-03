import * as React from 'react';
import { Tabs, Tab, Divider } from '@material-ui/core';
import TopologyDetailsTabPanel from './TopologyDetailsTabPanel';
import TopologyResourcesTabPanel from './TopologyResourcesTabPanel';
import { BaseNode } from '@patternfly/react-topology';

import './TopologySideBarBody.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <div className="topology-side-bar-tab-panel">{children}</div>
      )}
    </div>
  );
};

const TopologySideBarBody: React.FC<{ node: BaseNode }> = ({ node }) => {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <div className="topology-side-bar-tabs">
        <Tabs value={value} onChange={handleChange} indicatorColor="primary">
          <Tab label="Details" />
          <Tab label="Resources" />
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
