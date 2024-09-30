import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@backstage/core-plugin-api';

import { useMutation } from '@tanstack/react-query';
import { Formik, FormikHelpers } from 'formik';

import { DrawerContextProvider } from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  ApprovalTool,
  CreateImportJobRepository,
  ImportJobResponse,
  RepositorySelection,
} from '../../types';
import {
  getJobErrors,
  prepareDataForSubmission,
} from '../../utils/repository-utils';
import { AddRepositories } from './AddRepositories';

export const AddRepositoriesForm = () => {
  const bulkImportApi = useApi(bulkImportApiRef);
  const navigate = useNavigate();
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    excludedRepositories: {},
    approvalTool: ApprovalTool.Git,
  };

  const createImportJobs = (importOptions: {
    importJobs: CreateImportJobRepository[];
    dryRun?: boolean;
  }) =>
    bulkImportApi.createImportJobs(
      importOptions.importJobs,
      importOptions.dryRun,
    );

  const mutationCreate = useMutation(createImportJobs);

  const handleSubmit = async (
    values: AddRepositoriesFormValues,
    formikHelpers: FormikHelpers<AddRepositoriesFormValues>,
  ) => {
    formikHelpers.setSubmitting(true);
    formikHelpers.setStatus(null);
    const importRepositories = prepareDataForSubmission(
      values.repositories,
      values.approvalTool,
    );
    formikHelpers.setSubmitting(true);
    mutationCreate.mutate({
      importJobs: importRepositories,
      dryRun: true,
    });
    if (!mutationCreate.isError) {
      const dryRunErrors = getJobErrors(
        mutationCreate.data as ImportJobResponse[],
      );
      if (Object.keys(dryRunErrors?.errors || {}).length > 0) {
        formikHelpers.setStatus(dryRunErrors);
        formikHelpers.setSubmitting(false);
      } else {
        formikHelpers.setStatus(dryRunErrors); // to show info messages
        const submitResult = await mutationCreate.mutateAsync({
          importJobs: importRepositories,
        });
        formikHelpers.setSubmitting(true);
        const createJobErrors = getJobErrors(
          submitResult as ImportJobResponse[],
        );
        if (Object.keys(createJobErrors?.errors || {}).length > 0) {
          formikHelpers.setStatus(createJobErrors);
        } else {
          navigate(`..`);
        }
      }
    }

    formikHelpers.setSubmitting(false);
  };

  return (
    <DrawerContextProvider>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        <AddRepositories error={mutationCreate.error} />
      </Formik>
    </DrawerContextProvider>
  );
};
