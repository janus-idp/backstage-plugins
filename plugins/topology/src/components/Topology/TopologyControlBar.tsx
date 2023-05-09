import React from 'react';
import {
  action,
  Controller,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  TopologyControlBar as PfTopologyControlBar,
} from '@patternfly/react-topology';

type TopologyControlBarProps = {
  controller: Controller;
};

export const TopologyControlBar: React.FC<TopologyControlBarProps> = ({
  controller,
}) => (
  <PfTopologyControlBar
    controlButtons={createTopologyControlButtons({
      ...defaultControlButtonsOptions,
      zoomInCallback: action(() => {
        controller.getGraph().scaleBy(4 / 3);
      }),
      zoomOutCallback: action(() => {
        controller.getGraph().scaleBy(0.75);
      }),
      fitToScreenCallback: action(() => {
        controller.getGraph().fit(80);
      }),
      resetViewCallback: action(() => {
        controller.getGraph().reset();
        controller.getGraph().layout();
      }),
      legend: false,
    })}
  />
);
