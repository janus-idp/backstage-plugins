import * as React from 'react';
import { Label } from '@patternfly/react-core';

import './TopologyResourceLabels.css';

const TopologyResourceLabels: React.FC<{
  labels: { [key: string]: string };
}> = ({ labels }) => {
  return (
    <ul className="topology-resource-labels-list">
      {(Object.keys(labels ?? {}) ?? []).map((key: string, index) => (
        <li key={index}>
          <Label className="topology-resource-labels-list-item" color="blue">
            <span className="pf-c-label__content">
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
