import { Theme } from '@material-ui/core';
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

export const baseStyle = kialiStyle({
  display: 'contents',
  overflow: 'visible',
});

export const linkStyle = kialiStyle({
  color: '#06c',
  cursor: 'pointer',
});

export const getLinkStyle = (theme: Theme) =>
  kialiStyle({
    color: theme.palette.type === 'dark' ? '#9CC9FF' : '#06c',
    cursor: 'pointer',
  });

export const getChipStyle = (theme: Theme) => {
  return {
    backgroundColor: theme.palette.type === 'dark' ? '#3d5061' : '#e7f1fa',
  };
};
