import React from 'react';

import { Label } from '@patternfly/react-core';

import './TopologyResourceLabels.css';

type TopologyResourceLabelsProps = {
  labels: { [key: string]: string };
  dataTest?: string;
};

const TopologyResourceLabels = ({
  labels,
  dataTest,
}: TopologyResourceLabelsProps) => {
  return (
    <ul className="topology-resource-labels-list" data-testid={dataTest}>
      {Object.keys(labels ?? {}).map((key: string) => (
        <li key={key}>
          <Label className="topology-resource-labels-list-item" color="blue">
            <span className="pf-v5-c-label__content">
              <span className="label-key">{key}</span>
              <span>=</span>
              <span className="label-value">{labels[key]}</span>
            </span>
          </Label>
        </li>
      ))}
    </ul>
  );
};

export default TopologyResourceLabels;
