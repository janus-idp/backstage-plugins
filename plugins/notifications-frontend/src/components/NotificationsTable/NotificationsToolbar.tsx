import React, { MutableRefObject } from 'react';

import { MTableToolbar } from '@material-table/core';
import {
  Box,
  makeStyles,
  MenuItem,
  Select,
  withStyles,
} from '@material-ui/core';

const StyledMTableToolbar = withStyles(
  theme => ({
    root: {
      padding: theme.spacing(3, 0, 2.5, 2.5),
    },
    searchField: {
      paddingRight: theme.spacing(2),
    },
  }),
  { name: 'BackstageTableToolbar' },
)(MTableToolbar);

const useFilterStyles = makeStyles(
  _theme => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    createdAfterFilter: {
      fontSize: 18,
      whiteSpace: 'nowrap',
    },
  }),
  { name: 'BackstageTableFiltersContainer' },
);

export const CreatedAfterOptions: {
  [key: string]: { label: string; getDate: () => Date };
} = {
  last24h: {
    label: 'Last 24h',
    getDate: () => new Date(Date.now() - 24 * 3600 * 1000),
  },
  lastWeek: {
    label: 'Last week',
    getDate: () => new Date(Date.now() - 7 * 24 * 3600 * 1000),
  },
  all: {
    label: 'Any time',
    getDate: () => new Date(0),
  },
};

export const NotificationsToolbar = (toolbarProps: {
  toolbarRef: MutableRefObject<any>;
  onSearchChanged: (value: string) => void;
  createdAfter?: string;
  onCreatedAfterChanged: (value: string) => void;
}) => {
  const { toolbarRef, createdAfter } = toolbarProps;
  const filtersClasses = useFilterStyles();

  const handleOnCreatedAfterChanged = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    toolbarProps.onCreatedAfterChanged(event.target.value as string);
  };

  return (
    <Box className={filtersClasses.root}>
      <Box className={filtersClasses.root}>
        <Select
          label="Created after"
          className={filtersClasses.createdAfterFilter}
          placeholder="Notifications since"
          value={createdAfter}
          onChange={handleOnCreatedAfterChanged}
        >
          {Object.keys(CreatedAfterOptions).map((key: string) => (
            <MenuItem value={key} key={key}>
              {CreatedAfterOptions[key].label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <StyledMTableToolbar
        {...toolbarProps}
        ref={toolbarRef}
        onSearchChanged={toolbarProps.onSearchChanged}
      />
    </Box>
  );
};
