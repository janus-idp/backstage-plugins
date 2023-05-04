import * as React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';
import {
  DefaultEdge,
  GraphElement,
  isEdge,
  WithSelectionProps,
} from '@patternfly/react-topology';

type EdgeConnectProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps>;

const EdgeConnect: React.FunctionComponent<EdgeConnectProps> = ({
  element,
  ...rest
}) =>
  !element || !isEdge(element) ? null : (
    <DefaultEdge element={element} {...rest} />
  );

export default observer(EdgeConnect);
