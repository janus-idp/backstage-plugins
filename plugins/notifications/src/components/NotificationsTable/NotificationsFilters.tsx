import React from 'react';

import {
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';

import {
  GetNotificationsOrderByDirecEnum,
  GetNotificationsOrderByEnum,
} from '../../openapi';

export type NotificationsFiltersProps = {
  createdAfter?: string;
  unreadOnly?: boolean;
  sorting?: {
    orderBy: GetNotificationsOrderByEnum;
    orderByDirec: GetNotificationsOrderByDirecEnum;
  };
  onCreatedAfterChanged: (value: string) => void;
  onUnreadOnlyChanged: (checked: boolean | undefined) => void;
  setSorting: ({
    orderBy,
    orderByDirec,
  }: {
    orderBy: GetNotificationsOrderByEnum;
    orderByDirec: GetNotificationsOrderByDirecEnum;
  }) => void;
};

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

export const SortByOptions: {
  [key: string]: {
    label: string;
    orderBy: GetNotificationsOrderByEnum;
    orderByDirec: GetNotificationsOrderByDirecEnum;
  };
} = {
  newest: {
    label: 'Newest on top',
    orderBy: GetNotificationsOrderByEnum.Created,
    orderByDirec: GetNotificationsOrderByDirecEnum.Asc,
  },
  oldest: {
    label: 'Oldest on top',
    orderBy: GetNotificationsOrderByEnum.Created,
    orderByDirec: GetNotificationsOrderByDirecEnum.Desc,
  },
  topic: {
    label: 'Topic',
    orderBy: GetNotificationsOrderByEnum.Topic,
    orderByDirec: GetNotificationsOrderByDirecEnum.Asc,
  },
  origin: {
    label: 'Origin',
    orderBy: GetNotificationsOrderByEnum.Origin,
    orderByDirec: GetNotificationsOrderByDirecEnum.Asc,
  },
};

const getSortBy = (sorting: NotificationsFiltersProps['sorting']): string => {
  if (
    sorting?.orderBy === GetNotificationsOrderByEnum.Created &&
    sorting.orderByDirec === GetNotificationsOrderByDirecEnum.Desc
  ) {
    return 'oldest';
  }
  if (sorting?.orderBy === GetNotificationsOrderByEnum.Topic) {
    return 'topic';
  }
  if (sorting?.orderBy === GetNotificationsOrderByEnum.Origin) {
    return 'origin';
  }

  return 'newest';
};

export const NotificationsFilters = ({
  unreadOnly,
  createdAfter,
  sorting,
  onCreatedAfterChanged,
  onUnreadOnlyChanged,
  setSorting,
}: NotificationsFiltersProps) => {
  const sortBy = getSortBy(sorting);

  const handleOnCreatedAfterChanged = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    onCreatedAfterChanged(event.target.value as string);
  };

  const handleOnUnreadOnlyChanged = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    let value = undefined;
    if (event.target.value === 'unread') value = true;
    if (event.target.value === 'read') value = false;
    onUnreadOnlyChanged(value);
  };

  const handleOnSortByChanged = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const idx = (event.target.value as string) || 'newest';
    const option = SortByOptions[idx];
    setSorting({
      orderBy: option.orderBy,
      orderByDirec: option.orderByDirec,
    });
  };

  let unreadOnlyValue = 'all';
  if (unreadOnly) unreadOnlyValue = 'unread';
  if (unreadOnly === false) unreadOnlyValue = 'read';

  return (
    <>
      <Typography variant="h6">Filters</Typography>
      <Divider orientation="vertical" flexItem />
      <Grid container>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="notifications-filter-view">View</InputLabel>
            <Select
              labelId="notifications-filter-view"
              label="View"
              value={unreadOnlyValue}
              onChange={handleOnUnreadOnlyChanged}
            >
              <MenuItem value="unread">Unread only</MenuItem>
              <MenuItem value="read">Marked as read</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="notifications-filter-view">
              Created after
            </InputLabel>

            <Select
              label="Created after"
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
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="notifications-filter-sort">Sort by</InputLabel>

            <Select
              label="Sort by"
              placeholder="Field to sort by"
              value={sortBy}
              onChange={handleOnSortByChanged}
            >
              {Object.keys(SortByOptions).map((key: string) => (
                <MenuItem value={key} key={key}>
                  {SortByOptions[key].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};
