import React from 'react';

import { Split, SplitItem } from '@patternfly/react-core';

import './ResourceBadge.css';

const ResourceBadge = ({
  color,
  abbr,
  name,
  suffix,
}: {
  color: string;
  abbr: string;
  name: string;
  suffix?: React.ReactNode;
}) => {
  return (
    <Split className="bs-tkn-pipeline-visualization__label">
      <SplitItem style={{ marginRight: 'var(--pf-v5-global--spacer--sm)' }}>
        <span className="badge" style={{ backgroundColor: color }}>
          {abbr}
        </span>
      </SplitItem>
      <SplitItem>
        <span>{name}</span>
      </SplitItem>
      {suffix ? (
        <SplitItem style={{ marginLeft: 'var(--pf-v5-global--spacer--sm)' }}>
          {suffix}
        </SplitItem>
      ) : null}
    </Split>
  );
};

export default ResourceBadge;
