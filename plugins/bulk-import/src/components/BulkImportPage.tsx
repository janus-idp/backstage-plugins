import React from 'react';

import { Header, Page, TabbedLayout } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';

import FormControl from '@mui/material/FormControl';
import { Formik } from 'formik';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

import {
  AddRepositoriesFormValues,
  ApprovalTool,
  RepositorySelection,
} from '../types';
import { DeleteDialogContextProvider } from './DeleteDialogContext';
import { RepositoriesList } from './Repositories/RepositoriesList';

export const BulkImportPage = () => {
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    excludedRepositories: {},
    approvalTool: ApprovalTool.Git,
  };

  return (
    <RequirePermission
      permission={bulkImportPermission}
      resourceRef={bulkImportPermission.resourceType}
    >
      <Page themeId="tool">
        <Header title="Bulk import" />
        <DeleteDialogContextProvider>
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
        </DeleteDialogContextProvider>
      </Page>
    </RequirePermission>
  );
};
