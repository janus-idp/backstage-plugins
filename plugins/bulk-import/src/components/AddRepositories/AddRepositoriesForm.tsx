import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@backstage/core-plugin-api';

import { useMutation } from '@tanstack/react-query';
import { Formik, FormikHelpers } from 'formik';
import { get } from 'lodash';

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
  const [generalSubmitError, setGeneralSubmitError] = React.useState<{
    message: string;
    title: string;
  } | null>(null);
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    excludedRepositories: {},
    approvalTool: ApprovalTool.Git,
  };

  const createImportJobs = async (importOptions: {
    importJobs: CreateImportJobRepository[];
    dryRun?: boolean;
  }) => {
    return await bulkImportApi.createImportJobs(
      importOptions.importJobs,
      importOptions.dryRun,
    );
  };

  const mutationCreate = useMutation(createImportJobs, {
    onSuccess: (data: ImportJobResponse[] | Response) => {
      return data;
    },
    onError: (error: Error) => {
      setGeneralSubmitError({
        message: error?.message || 'Error occured',
        title: error?.name,
      });
    },
  });

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
    try {
      formikHelpers.setSubmitting(true);
      mutationCreate.mutate({ importJobs: importRepositories, dryRun: true });
      // const dryrunResponse: ImportJobResponse[] =
      //   await bulkImportApi.createImportJobs(importRepositories, true);

      const dryRunErrors = getJobErrors(
        mutationCreate.data as ImportJobResponse[],
      );
      if (Object.keys(dryRunErrors?.errors || {}).length > 0) {
        formikHelpers.setStatus(dryRunErrors);
        formikHelpers.setSubmitting(false);
      } else {
        formikHelpers.setStatus(dryRunErrors); // to show info messages
        // const createJobResponse: ImportJobResponse[] | Response =
        //   await bulkImportApi.createImportJobs(importRepositories);
        mutationCreate.mutate({ importJobs: importRepositories });
        formikHelpers.setSubmitting(true);
        if (!Array.isArray(mutationCreate.data)) {
          setGeneralSubmitError({
            message:
              get(mutationCreate.data, 'error.message') ||
              'Failed to create pull request',
            title: get(mutationCreate.data, 'error.name') || 'Error occured',
          });
          formikHelpers.setSubmitting(false);
        } else {
          const createJobErrors = getJobErrors(mutationCreate.data);
          if (Object.keys(createJobErrors?.errors || {}).length > 0) {
            formikHelpers.setStatus(createJobErrors);
            formikHelpers.setSubmitting(false);
          } else {
            navigate(`..`);
          }
        }
      }
    } catch (error: any) {
      setGeneralSubmitError({
        message: error?.message || 'Error occured',
        title: error?.name,
      });
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <DrawerContextProvider>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        <AddRepositories error={generalSubmitError} />
      </Formik>
    </DrawerContextProvider>
  );
};
