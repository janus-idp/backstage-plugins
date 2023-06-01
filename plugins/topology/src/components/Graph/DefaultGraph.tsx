import React from 'react';

import {
  Graph,
  GraphComponent,
  GraphElement,
  isGraph,
  observer,
  WithPanZoomProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

type DefaultGraphProps = {
  element?: GraphElement;
} & Partial<WithPanZoomProps> &
  Partial<WithSelectionProps>;

const DefaultGraph = ({ element, ...rest }: DefaultGraphProps) => {
  if (!isGraph) {
    return null;
  }
  return (
    <GraphComponent
      element={element as Graph}
      // The parameters need to be made optional in GraphComponent. Overwritten by ...rest if passed
      panZoomRef={() => {}}
      dndDropRef={() => {}}
      selected={false}
      onSelect={() => {}}
      onContextMenu={() => {}}
      contextMenuOpen={false}
      {...rest}
    />
  );
};

export default observer(DefaultGraph);
