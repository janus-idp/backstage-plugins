import React from 'react';
import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Toolbar,
} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';
import Search from '@material-ui/icons/Search';
import useDebounce from 'react-use/lib/useDebounce';
import { ImageStreamMetadata } from '../../types';

const useStyles = makeStyles(_theme => ({
  searchToolbar: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  input: {},
}));

type OcirImageSearchBarProps = {
  imageStreams: ImageStreamMetadata[];
  setImageStreams: React.Dispatch<
    React.SetStateAction<ImageStreamMetadata[] | undefined>
  >;
};

export const OcirImageSearchBar = ({
  imageStreams,
  setImageStreams,
}: OcirImageSearchBarProps) => {
  const classes = useStyles();

  const [search, setSearch] = React.useState<string>('');

  const searchByName = () => {
    const filteredImageStreams = imageStreams
      ? imageStreams.filter((imgSt: ImageStreamMetadata) =>
          imgSt.name.includes(search),
        )
      : undefined;
    setImageStreams(filteredImageStreams);
  };

  useDebounce(
    () => {
      searchByName();
    },
    100,
    [search],
  );

  return (
    <Toolbar className={classes.searchToolbar}>
      <FormControl>
        <Input
          aria-label="search"
          className={classes.input}
          placeholder="Search by Name"
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
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Toolbar>
  );
};
