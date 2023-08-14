import React from 'react';

import { isEqual } from 'lodash';

export const useDeepCompareMemoize = <T = any>(
  value: T,
  stringify?: boolean,
): T => {
  const ref = React.useRef<T>();

  if (
    stringify
      ? JSON.stringify(value) !== JSON.stringify(ref.current)
      : !isEqual(value, ref.current)
  ) {
    ref.current = value;
  }

  return ref.current as T;
};
