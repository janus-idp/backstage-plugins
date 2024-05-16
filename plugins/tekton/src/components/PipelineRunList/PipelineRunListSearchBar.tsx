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

type PipelineRunListSearchBarProps = {
  value: string;
  onChange: (filter: string) => void;
};

const useStyles = makeStyles({
  formControl: {
    alignItems: 'flex-end',
    flexGrow: 1,
  },
});

export const PipelineRunListSearchBar = ({
  value,
  onChange,
}: PipelineRunListSearchBarProps) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <Input
        aria-label="search"
        placeholder="Search"
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
