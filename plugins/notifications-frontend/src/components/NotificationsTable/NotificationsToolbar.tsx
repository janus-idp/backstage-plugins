import React, { MutableRefObject, useCallback } from 'react';

import { MTableToolbar } from '@material-table/core';
import { Box, makeStyles, Typography, withStyles } from '@material-ui/core';

const StyledMTableToolbar = withStyles(
  theme => ({
    root: {
      padding: theme.spacing(3, 0, 2.5, 2.5),
    },
    // title: {
    //   '& > h6': {
    //     fontWeight: theme.typography.fontWeightBold,
    //   },
    // },
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
      justifyContent: 'space-between',
    },
    createdAfterFilter: {
      // fontWeight: theme.typography.fontWeightBold,
      fontSize: 18,
      whiteSpace: 'nowrap',
    },
  }),
  { name: 'BackstageTableFiltersContainer' },
);

export const NotificationsToolbar = (toolbarProps: {
  toolbarRef: MutableRefObject<any>;
  setSearch: (value: string) => void;
  onSearchChanged: (value: string) => void;
}) => {
  const { toolbarRef, setSearch } = toolbarProps;
  const onSearchChanged = useCallback(
    (searchText: string) => {
      toolbarProps.onSearchChanged(searchText);
      setSearch(searchText);
    },
    [toolbarProps, setSearch],
  );
  const filtersClasses = useFilterStyles();

  return (
    <Box className={filtersClasses.root}>
      <Box className={filtersClasses.root}>
        <Typography className={filtersClasses.createdAfterFilter}>
          Created After
        </Typography>
      </Box>
      <StyledMTableToolbar
        {...toolbarProps}
        ref={toolbarRef}
        onSearchChanged={onSearchChanged}
      />
    </Box>
  );
};
