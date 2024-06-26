import React from 'react';

import { Header, Page, TabbedLayout } from '@backstage/core-components';

import { Formik } from 'formik';

import { AddRepositoriesFormValues } from '../types';
import { RepositoriesListForm } from './Repositories/RepositoriesListForm';

export const BulkImportPage = () => {
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: 'repository',
    repositories: {},
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
            <RepositoriesListForm />
          </Formik>
        </TabbedLayout.Route>
      </TabbedLayout>
    </Page>
  );
};
