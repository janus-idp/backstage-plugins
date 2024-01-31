import * as React from 'react';

import { Icon } from '@patternfly/react-core';

import { kialiStyle } from '../../styles/StyleUtils';
import { Status } from '../../types/Health';

type Size = 'sm' | 'md' | 'lg' | 'xl';

export const createIcon = (status: Status, size?: Size) => {
  const classForColor = kialiStyle({
    color: status.color,
  });
  return React.createElement(
    Icon,
    { size: size, className: `${status.class} ${classForColor}` },
    React.createElement(status.icon),
  );
};
