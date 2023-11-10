import React from 'react';
import useDebounce from 'react-use/lib/useDebounce';

import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';
import Search from '@material-ui/icons/Search';

import { PipelineRunKind } from '@janus-idp/shared-react';

type PipelineRunListSearchBarProps = {
  pipelineRuns?: PipelineRunKind[];
  onSearch: React.Dispatch<React.SetStateAction<PipelineRunKind[] | undefined>>;
};

const useStyles = makeStyles({
  formControl: {
    alignItems: 'flex-end',
    flexGrow: 1,
  },
});

export const PipelineRunListSearchBar = ({
  pipelineRuns,
  onSearch,
}: PipelineRunListSearchBarProps) => {
  const [search, setSearch] = React.useState<string>('');
  const classes = useStyles();

  const searchByName = () => {
    const filteredPipelineRuns =
      pipelineRuns && search
        ? pipelineRuns.filter((plr: PipelineRunKind) => {
            const s = search.toUpperCase();
            const n = plr.metadata?.name?.toUpperCase();
            return n?.includes(s);
          })
        : undefined;
    onSearch(filteredPipelineRuns);
  };

  useDebounce(
    () => {
      searchByName();
    },
    100,
    [search],
  );

  return (
    <FormControl className={classes.formControl}>
      <Input
        aria-label="search"
        placeholder="Search"
        autoComplete="off"
        onChange={event => setSearch(event.target.value)}
        value={search}
        startAdornment={
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={() => setSearch('')}
              edge="end"
              disabled={search.length === 0}
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
