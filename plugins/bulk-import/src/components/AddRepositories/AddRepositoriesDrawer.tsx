import React, { useState } from 'react';

import { Link } from '@backstage/core-components';

import {
  Button,
  Card,
  Container,
  Drawer,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFormikContext } from 'formik';

import {
  AddedRepositories,
  AddRepositoriesFormValues,
  AddRepositoryData,
} from '../../types';
import { urlHelper } from '../../utils/repository-utils';
import { AddRepositoriesTableToolbar } from './AddRepositoriesTableToolbar';
import { RepositoriesTable } from './RepositoriesTable';

const useStyles = makeStyles(theme => ({
  createButton: {
    marginRight: theme.spacing(1),
  },
  sidePanelfooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'right',
    marginTop: theme.spacing(2),
    position: 'fixed',
    bottom: '20px',
  },
  drawerPaper: {
    ['@media (max-width: 960px)']: {
      '& > div[class*="MuiDrawer-paper-"]': {
        width: '-webkit-fill-available',
      },
    },
  },
  drawerContainer: {
    padding: '20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const AddRepositoriesDrawer = ({
  open,
  onClose,
  onSelect,
  title,
  orgData,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (repos: AddedRepositories, drawerOrgName: string) => void;
  title: string;
  orgData: AddRepositoryData;
}) => {
  const classes = useStyles();
  const { values, status, setStatus } =
    useFormikContext<AddRepositoriesFormValues>();
  const [searchString, setSearchString] = useState<string>('');
  const [selectedRepos, setSelectedRepos] = useState<AddedRepositories>({});

  const updateSelectedReposInDrawer = (repos: AddedRepositories) => {
    setSelectedRepos(repos);
  };

  const handleSelectRepoFromDrawer = (selected: AddedRepositories) => {
    onSelect(selected, orgData?.orgName || '');
    const newStatus = { ...(status?.errors || {}) };
    Object.keys(newStatus).forEach(s => {
      if (!Object.keys(selected).find(sel => sel === s)) {
        delete newStatus[s];
      }
    });
    setStatus({ ...status, errors: newStatus });
    onClose();
  };

  React.useEffect(() => {
    const sr = Object.values(values.repositories).reduce(
      (acc, repo) =>
        repo.orgName === orgData?.orgName ? { ...acc, [repo.id]: repo } : acc,
      {},
    );
    setSelectedRepos(sr);
  }, [orgData?.orgName, values.repositories]);

  return (
    <Drawer
      anchor="right"
      open={open}
      variant="temporary"
      className={classes.drawerPaper}
    >
      <Container className={classes.drawerContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="h5">{orgData?.orgName}</Typography>
            <Link to={orgData?.organizationUrl || ''}>
              {urlHelper(orgData?.organizationUrl || '')}
              <OpenInNewIcon
                style={{ verticalAlign: 'sub', paddingTop: '7px' }}
              />
            </Link>
          </div>
          <div>
            <IconButton onClick={onClose} className="align-right">
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <Card style={{ marginTop: '20px', marginBottom: '60px' }}>
          <AddRepositoriesTableToolbar
            title={title}
            setSearchString={setSearchString}
            selectedReposFromDrawer={selectedRepos}
            activeOrganization={orgData?.orgName}
          />
          <RepositoriesTable
            searchString={searchString}
            updateSelectedReposInDrawer={updateSelectedReposInDrawer}
            drawerOrganization={orgData?.orgName}
          />
        </Card>
        <div className={classes.sidePanelfooter}>
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSelectRepoFromDrawer(selectedRepos)}
              className={classes.createButton}
              data-testid="select-from-drawer"
            >
              Select
            </Button>
          </span>
          <span>
            <Button
              data-testid="close-drawer"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
          </span>
        </div>
      </Container>
    </Drawer>
  );
};
