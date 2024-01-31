import { style } from 'typestyle';
import { NestedCSSProperties } from 'typestyle/lib/types';

const cssPrefix = process.env.CSS_PREFIX ?? 'kiali';

/**
 * Add prefix to CSS classname (mandatory in some plugins like OSSMC)
 * Default prefix value is kiali if the environment variable CSS_PREFIX is not defined
 */
export const kialiStyle = (styleProps: NestedCSSProperties) => {
  return style({
    $debugName: cssPrefix,
    ...styleProps,
  });
};
