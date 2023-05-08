import {
  Graph,
  GraphComponent,
  GraphElement,
  WithPanZoomProps,
  WithSelectionProps,
  isGraph,
  observer,
} from '@patternfly/react-topology';
import * as React from 'react';

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
