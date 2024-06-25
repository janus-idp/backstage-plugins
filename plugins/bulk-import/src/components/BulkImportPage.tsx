import React from 'react';

import { Header, Page, TabbedLayout } from '@backstage/core-components';

import FormControl from '@mui/material/FormControl';
import { Formik } from 'formik';

import { AddRepositoriesFormValues, RepositorySelection } from '../types/types';
import { RepositoriesList } from './Repositories/RepositoriesList';

export const BulkImportPage = () => {
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    excludedRepositories: {},
    approvalTool: 'git',
  };

  return (
    <Page themeId="tool">
      <Header title="Bulk import" />
      <TabbedLayout>
        <TabbedLayout.Route path="/" title="Repositories">
          <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={async (_values: AddRepositoriesFormValues) => {}}
          >
            <FormControl fullWidth>
              <RepositoriesList />
            </FormControl>
          </Formik>
        </TabbedLayout.Route>
      </TabbedLayout>
    </Page>
  );
};
