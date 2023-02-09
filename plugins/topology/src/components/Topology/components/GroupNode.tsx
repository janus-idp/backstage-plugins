import * as React from 'react';
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

const GroupNode: React.FunctionComponent<GroupNodeProps> = ({ element, ...rest }) => {
  const detailsLevel = useDetailsLevel();

  if (!element || !isNode(element)) {
    return null;
  }

  return (
    <DefaultGroup
      element={element}
      showLabel={detailsLevel === ScaleDetailsLevel.high}
      {...rest}
    >
    </DefaultGroup>
  );
};

export default observer(GroupNode);
