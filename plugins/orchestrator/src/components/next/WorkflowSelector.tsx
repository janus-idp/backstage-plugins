import React from 'react';

import { Select, SelectedItems, SelectItem } from '@backstage/core-components';

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

const ALL = '___all___';

export type WorkflowSelectorProps = {
  onChange: (item?: string) => void;
  workflows: SelectItem[];
  value?: string;
  includeAll?: boolean;
};

export const WorkflowSelector = ({
  onChange,
  workflows,
  value,
  includeAll = true,
}: WorkflowSelectorProps) => {
  const styles = useStyles();

  const allWorkflows = includeAll
    ? [{ label: 'All', value: ALL }, ...workflows]
    : workflows;

  const selected = allWorkflows?.find(item => item.value === value)?.value;

  const handleOnChange = (item: SelectedItems) => {
    onChange(item === ALL ? undefined : (item as string));
  };

  return (
    <div className={styles.root}>
      <Typography className={styles.label}>Workflow</Typography>
      <Select
        onChange={handleOnChange}
        items={allWorkflows}
        selected={selected}
        margin="dense"
        native
        label=""
      />
    </div>
  );
};
