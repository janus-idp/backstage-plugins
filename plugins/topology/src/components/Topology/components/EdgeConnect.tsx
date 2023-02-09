import * as React from 'react';
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
}) => {
  const data = element?.getData() ?? {};

  const passedData = React.useMemo(() => {
    if (!element) {
      return {};
    }
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
      if (newData[key] === undefined) {
        delete newData[key];
      }
    });
    return newData;
  }, [data]);

  if (!element || !isEdge(element)) {
    return null;
  }
  return (
    <DefaultEdge
      element={element}
      {...rest}
      {...passedData}
    />
  );
};

export default observer(EdgeConnect);
