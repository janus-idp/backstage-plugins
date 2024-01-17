import React from 'react';

import { Select } from '@backstage/core-components';

import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'baseline',
    '& label + div': {
      marginTop: '0px',
    },
    '& select': {
      width: '7rem',
    },
  },
  label: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.fontSize,
    paddingRight: '0.5rem',
    fontWeight: 'bold',
  },
}));

const ALL_ITEMS = '___all___';

type BackstageSelectProps = Parameters<typeof Select>[0];
export type SelectorProps = Omit<BackstageSelectProps, 'onChange'> & {
  includeAll?: boolean;
  onChange: (item: string) => void;
};

export const Selector = ({
  includeAll = true,
  ...otherProps
}: SelectorProps) => {
  const styles = useStyles();

  const selectItems = React.useMemo(
    () =>
      includeAll
        ? [{ label: 'All', value: ALL_ITEMS }, ...otherProps.items]
        : otherProps.items,
    [includeAll, otherProps.items],
  );

  const handleChange = React.useCallback(
    item => otherProps.onChange(item as string),
    [otherProps],
  );

  return (
    <div className={styles.root}>
      <Typography className={styles.label}>{otherProps.label}</Typography>
      <Select
        onChange={handleChange}
        items={selectItems}
        selected={otherProps.selected}
        margin="dense"
        native
        label={otherProps.label}
      />
    </div>
  );
};
Selector.displayName = 'Selector';
Selector.AllItems = ALL_ITEMS;
