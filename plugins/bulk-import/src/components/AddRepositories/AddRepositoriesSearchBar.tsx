import React from 'react';

import { makeStyles } from '@material-ui/core';
import Clear from '@mui/icons-material/Clear';
import Search from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';

type RepositoriesSearchBarProps = {
  value: string;
  onChange: (filter: string) => void;
};

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
}: RepositoriesSearchBarProps) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <Input
        aria-label="search"
        placeholder="Search"
        autoComplete="off"
        onChange={event => onChange(event.target.value)}
        value={value}
        size="medium"
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
