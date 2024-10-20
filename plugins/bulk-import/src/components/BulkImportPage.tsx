import React from 'react';

import { Content, Header, Page, Progress } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControl from '@mui/material/FormControl';
import { Formik } from 'formik';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';
import {
  DeleteDialogContextProvider,
  DrawerContextProvider,
} from '@janus-idp/shared-react';

import {
  AddRepositoriesFormValues,
  ApprovalTool,
  RepositorySelection,
} from '../types';
import { RepositoriesList } from './Repositories/RepositoriesList';

export const BulkImportPage = () => {
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    excludedRepositories: {},
    approvalTool: ApprovalTool.Git,
  };

  const bulkImportViewPermissionResult = usePermission({
    permission: bulkImportPermission,
    resourceRef: bulkImportPermission.resourceType,
  });

  const showContent = () => {
    if (bulkImportViewPermissionResult.loading) {
      return <Progress />;
    }
    if (bulkImportViewPermissionResult.allowed) {
      return (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={async (_values: AddRepositoriesFormValues) => {}}
        >
          <FormControl fullWidth>
            <RepositoriesList />
          </FormControl>
        </Formik>
      );
    }
    return (
      <Alert severity="warning" data-testid="no-permission-alert">
        <AlertTitle>Permission required</AlertTitle>
        To view the added repositories, contact your administrator to give you
        the `bulk.import` permission.
      </Alert>
    );
  };

  return (
    <Page themeId="tool">
      <Header title="Bulk import" />
      <DrawerContextProvider>
        <DeleteDialogContextProvider>
          <Content noPadding>
            <div style={{ padding: '24px' }}>{showContent()}</div>
          </Content>
        </DeleteDialogContextProvider>
      </DrawerContextProvider>
    </Page>
  );
};
