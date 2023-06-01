import React from 'react';

import {
  DefaultGroup,
  GraphElement,
  isNode,
  observer,
  ScaleDetailsLevel,
  useDetailsLevel,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

type GroupNodeProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const GroupNode = ({ element, ...rest }: GroupNodeProps) => {
  const detailsLevel = useDetailsLevel();

  if (!element || !isNode(element)) {
    return null;
  }

  return (
    <DefaultGroup element={element} showLabel={detailsLevel === ScaleDetailsLevel.high} {...rest} />
  );
};

export default observer(GroupNode);
