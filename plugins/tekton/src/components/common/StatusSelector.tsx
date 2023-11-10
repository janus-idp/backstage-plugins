import React from 'react';

import { Select, SelectedItems } from '@backstage/core-components';

import { makeStyles, Theme, Typography } from '@material-ui/core';

import './StatusSelector.css';

import { computedStatus } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

const useStyles = makeStyles<Theme>(theme => ({
  label: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    paddingRight: '10px',
    fontWeight: 'bold',
  },
}));

export const statusOptions = Object.keys(computedStatus)
  .sort((a, b) => {
    if (a === b) {
      return 0;
    } else if (a < b) {
      return -1;
    }
    return 1;
  })
  .map((status: string) => ({
    value: computedStatus[status],
    label: status,
  }));

export const StatusSelector = () => {
  const classes = useStyles();
  const { selectedStatus, setSelectedStatus } = React.useContext(
    TektonResourcesContext,
  );

  const onStatusChange = (status: SelectedItems) => {
    setSelectedStatus(status as string);
  };

  return (
    <div className="bs-tkn-status-selector">
      <Typography className={classes.label}>Status</Typography>
      <Select
        onChange={onStatusChange}
        label=""
        items={statusOptions}
        selected={selectedStatus}
        margin="dense"
        native
      />
    </div>
  );
};
