import React from 'react';

import {
  ComponentFactory,
  Visualization,
  VisualizationProvider,
} from '@patternfly/react-topology';

import TopologyComponentFactory from '../Graph/TopologyComponentFactory';
import defaultLayoutFactory from '../layouts/defaultLayoutFactory';
import TopologyViewWorkloadComponent from './TopologyViewWorkloadComponent';

export const TopologyWorkloadView = React.memo(() => {
  const controller = new Visualization();
  controller.registerLayoutFactory(defaultLayoutFactory);
  controller.registerComponentFactory(
    TopologyComponentFactory as ComponentFactory,
  );

  return (
    <VisualizationProvider controller={controller}>
      <TopologyViewWorkloadComponent useToolbar />
    </VisualizationProvider>
  );
});
