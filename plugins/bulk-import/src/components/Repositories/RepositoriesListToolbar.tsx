import React from 'react';

import { LinkButton } from '@backstage/core-components';

import { makeStyles, Toolbar } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues } from '../../types';
import { RepositoriesSearchBar } from '../AddRepositories/AddRepositoriesSearchBar';

const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'end',
    padding: '14px',
  },
  rbacPreReqLink: {
    color: theme.palette.link,
  },
  alertTitle: {
    fontWeight: 'bold',
  },
}));

export const RepositoriesListToolbar = ({
  jobs,
  setSearchString,
}: {
  jobs: number;
  setSearchString: (str: string) => void;
}) => {
  const { status, setStatus } = useFormikContext<AddRepositoriesFormValues>();
  const [search, setSearch] = React.useState<string>('');
  const classes = useStyles();

  const handleCloseAlert = () => {
    setStatus(null);
  };

  const handleSearch = (filter: string) => {
    setSearchString(filter);
    setSearch(filter);
  };

  return (
    <>
      {(status?.title || status?.url) && (
        <>
          <Alert severity="error" onClose={() => handleCloseAlert()}>
            <AlertTitle>
              Error occured while fetching the pull request
            </AlertTitle>
            {`${status?.title} ${status?.url}`}
          </Alert>
          <br />
        </>
      )}
      <Toolbar className={classes.toolbar}>
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h5"
          id="added-repositories"
        >
          {jobs ? `Added repositories (${jobs})` : 'Added repositories'}
        </Typography>

        <span className={classes.toolbar}>
          <LinkButton
            to="add"
            color="primary"
            variant="contained"
            data-testid="add-repository"
          >
            Add
          </LinkButton>
        </span>
        <RepositoriesSearchBar value={search} onChange={handleSearch} />
      </Toolbar>
    </>
  );
};
