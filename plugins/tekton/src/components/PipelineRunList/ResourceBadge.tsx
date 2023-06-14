import React from 'react';

import { Split, SplitItem } from '@patternfly/react-core';

import './ResourceBadge.css';

const ResourceBadge = ({
  color,
  abbr,
  name,
}: {
  color: string;
  abbr: string;
  name: string;
}) => {
  return (
    <Split className="bs-tkn-pipeline-visualization__label">
      <SplitItem style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
        <span className="badge" style={{ backgroundColor: color }}>
          {abbr}
        </span>
      </SplitItem>
      <SplitItem>
        <span>{name}</span>
      </SplitItem>
    </Split>
  );
};

export default ResourceBadge;
