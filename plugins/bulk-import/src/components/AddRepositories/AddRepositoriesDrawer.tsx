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
import CloseIcon from '@material-ui/icons/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { AddRepositoriesData, AddRepositoriesFormValues } from '../../types';
import { urlHelper } from '../../utils/repository-utils';
import { AddRepositoriesTableToolbar } from './AddRepositoriesTableToolbar';
import { RepositoriesTable } from './RepositoriesTable';

type AddRepositoriesDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (ids: number[], drawerOrgId: number) => void;
  title: string;
  data: AddRepositoriesData;
  selectedRepositoriesFormData: AddRepositoriesFormValues;
  checkedRepos: number[];
};

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
  data,
  selectedRepositoriesFormData,
  checkedRepos,
}: AddRepositoriesDrawerProps) => {
  const classes = useStyles();
  const [searchString, setSearchString] = useState<string>('');

  const [selectedReposID, setSelectedReposID] =
    useState<number[]>(checkedRepos);

  const updateSelectedReposInDrawer = (ids: number[]) => {
    setSelectedReposID(ids);
  };

  const handleSelectRepoFromDrawer = (selected: number[]) => {
    onSelect(selected, data?.id);
    onClose();
  };

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
            <Typography variant="h5">{data?.name}</Typography>
            <Link to={data?.url}>
              {urlHelper(data?.url)}
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
            selectedReposFromDrawer={selectedReposID}
            selectedRepositoriesFormData={selectedRepositoriesFormData}
            activeOrganization={data}
          />
          <RepositoriesTable
            searchString={searchString}
            selectedOrgRepos={selectedReposID}
            updateSelectedReposInDrawer={updateSelectedReposInDrawer}
            drawerOrganization={data}
          />
        </Card>
        <div className={classes.sidePanelfooter}>
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSelectRepoFromDrawer(selectedReposID)}
              className={classes.createButton}
              aria-labelledby="select-from-drawer"
            >
              Select
            </Button>
          </span>
          <span>
            <Button
              aria-labelledby="cancel-drawer-select"
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
