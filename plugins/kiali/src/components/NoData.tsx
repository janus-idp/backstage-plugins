import React from 'react';

import { EmptyState } from '@backstage/core-components';

const containerStyle = { width: '100%', height: '100%' };

export const NoData = (props: { title: string; description: string }) => {
  return (
    <div style={containerStyle}>
      <EmptyState
        missing="data"
        title={props.title}
        description={props.description}
      />
    </div>
  );
};
