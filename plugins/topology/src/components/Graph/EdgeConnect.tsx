import React from 'react';

import {
  DefaultEdge,
  GraphElement,
  isEdge,
  WithSelectionProps,
} from '@patternfly/react-topology';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';

type EdgeConnectProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps>;

const EdgeConnect = ({ element, ...rest }: EdgeConnectProps) =>
  !element || !isEdge(element) ? null : (
    <DefaultEdge element={element} {...rest} />
  );

export default observer(EdgeConnect);
