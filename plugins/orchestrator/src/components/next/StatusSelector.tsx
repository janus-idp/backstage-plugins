import React from 'react';

import { Select, SelectedItems, SelectItem } from '@backstage/core-components';

import { makeStyles, Typography } from '@material-ui/core';

import { ProcessInstanceState } from '@janus-idp/backstage-plugin-orchestrator-common';

import { humanizeProcessInstanceState } from './utils';

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

export type StatusSelectorProps = {
  onChange: (item?: string) => void;
  value?: string;
  includeAll?: boolean;
};

export const StatusSelector = ({
  onChange,
  value,
  includeAll = true,
}: StatusSelectorProps) => {
  const styles = useStyles();

  let statuses: SelectItem[] = [];
  if (includeAll) {
    statuses = [{ label: 'All', value: ALL }];
  }
  statuses = [
    ...statuses,
    ...[
      ProcessInstanceState.Active,
      ProcessInstanceState.Completed,
      ProcessInstanceState.Error,
      ProcessInstanceState.Aborted,
      ProcessInstanceState.Suspended,
    ].map(status => ({
      label: humanizeProcessInstanceState(status),
      value: status,
    })),
  ];

  const selected = statuses?.find(item => item.value === value)?.value;

  const handleOnChange = (item: SelectedItems) => {
    onChange(item === ALL ? undefined : (item as string));
  };

  return (
    <div className={styles.root}>
      <Typography className={styles.label}>Status</Typography>
      <Select
        onChange={handleOnChange}
        items={statuses}
        selected={selected}
        margin="dense"
        native
        label=""
      />
    </div>
  );
};
