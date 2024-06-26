import React, { useEffect } from 'react';
import { useAsync } from 'react-use';

import { ErrorPage, Progress, Table } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { makeStyles } from '@material-ui/core';
import { useFormikContext } from 'formik';

import { getDataForRepositories } from '../../mocks/mockData';
import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  RepositoryStatus,
} from '../../types';
import { columns } from './RepositoriesListColumns';
import { RepositoriesListToolbar } from './RepositoriesListToolbar';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const RepositoriesList = () => {
  const classes = useStyles();
  const [addedRepositories, setAddedRepositories] = React.useState<number>(0);
  const identityApi = useApi(identityApiRef);
  const {
    loading,
    error,
    value: user,
  } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  const { values, setFieldValue } =
    useFormikContext<AddRepositoriesFormValues>();
  const addedRepositoriesCount = Object.keys(values.repositories).length;

  useEffect(() => {
    if (user) {
      const fetchedData = getDataForRepositories(user || '').filter(
        (data: AddRepositoriesData) =>
          data.catalogInfoYaml?.status === RepositoryStatus.Exists,
      );
      const repositories: { [key: string]: AddRepositoriesData } = {};
      fetchedData.forEach(repo => {
        repositories[repo.repoName || ''] = repo;
      });
      setFieldValue('repositories', repositories);
    }
  }, [user, setFieldValue]);

  useEffect(() => {
    setAddedRepositories(addedRepositoriesCount);
  }, [addedRepositoriesCount]);

  const onSearchResultsChange = (searchResults: AddRepositoriesData[]) => {
    setAddedRepositories(searchResults.length);
  };

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ErrorPage status={error.name} statusMessage={error.message} />;
  }

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        title={`Added repositories (${addedRepositories ?? Object.keys(values.repositories).length})`}
        options={{ padding: 'default', search: true, paging: true }}
        data={Object.values(values.repositories)}
        isLoading={false}
        renderSummaryRow={summary => onSearchResultsChange(summary.data)}
        columns={columns}
        emptyContent={
          <div data-testid="repositories-table-empty" className={classes.empty}>
            No records found
          </div>
        }
      />
    </>
  );
};
