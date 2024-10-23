import React from 'react';

import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';
import Search from '@material-ui/icons/Search';

const useStyles = makeStyles({
  formControl: {
    alignItems: 'flex-end',
    flexGrow: 1,
    paddingLeft: '21px',
  },
});

export const RepositoriesSearchBar = ({
  value,
  onChange,
  activeOrganization,
}: {
  value: string;
  onChange: (filter: string) => void;
  activeOrganization?: boolean;
}) => {
  const classes = useStyles();
  const ariaLabel = activeOrganization ? 'search-in-organization' : 'search';

  return (
    <FormControl className={classes.formControl}>
      <Input
        data-testid={ariaLabel}
        placeholder="Search"
        inputProps={{ 'aria-label': ariaLabel }}
        autoComplete="off"
        onChange={event => onChange(event.target.value)}
        value={value}
        startAdornment={
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={() => onChange('')}
              edge="end"
              disabled={!value}
              data-testid="clear-search"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
