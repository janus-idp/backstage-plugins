import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Content, Header, Page, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import { Formik, FormikHelpers } from 'formik';
import { get } from 'lodash';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';
import { DrawerContextProvider } from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  ApprovalTool,
  ImportJobResponse,
  RepositorySelection,
} from '../../types';
import {
  getJobErrors,
  prepareDataForSubmission,
} from '../../utils/repository-utils';
import { AddRepositoriesForm } from './AddRepositoriesForm';
import { Illustrations } from './Illustrations';

const useStyles = makeStyles(() => ({
  accordionDetails: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    overflow: 'auto',
  },
}));

export const AddRepositoriesPage = () => {
  const theme = useTheme();
  const classes = useStyles();
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

  const bulkImportApi = useApi(bulkImportApiRef);
  const bulkImportViewPermissionResult = usePermission({
    permission: bulkImportPermission,
    resourceRef: bulkImportPermission.resourceType,
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
      const dryrunResponse: ImportJobResponse[] =
        await bulkImportApi.createImportJobs(importRepositories, true);
      const dryRunErrors = getJobErrors(dryrunResponse);
      if (Object.keys(dryRunErrors?.errors || {}).length > 0) {
        formikHelpers.setStatus(dryRunErrors);
        formikHelpers.setSubmitting(false);
      } else {
        formikHelpers.setStatus(dryRunErrors); // to show info messages
        const createJobResponse: ImportJobResponse[] | Response =
          await bulkImportApi.createImportJobs(importRepositories);
        formikHelpers.setSubmitting(true);
        if (!Array.isArray(createJobResponse)) {
          setGeneralSubmitError({
            message:
              get(createJobResponse, 'error.message') ||
              'Failed to create pull request',
            title: get(createJobResponse, 'error.name') || 'Error occured',
          });
          formikHelpers.setSubmitting(false);
        } else {
          const createJobErrors = getJobErrors(createJobResponse);
          if (Object.keys(createJobErrors?.errors || {}).length > 0) {
            formikHelpers.setStatus(createJobErrors);
            formikHelpers.setSubmitting(false);
          } else {
            navigate(`../bulk-import/repositories`);
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
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content noPadding>
        {bulkImportViewPermissionResult.loading && <Progress />}
        {bulkImportViewPermissionResult.allowed ? (
          <>
            <div style={{ padding: '24px' }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="add-repository-summary"
                >
                  <Typography variant="h5">
                    Add repositories to Red Hat Developer Hub in 4 steps
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  {/* <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-approval-tool-white'
                    : 'icon-approval-tool-black'
                }
                iconText="Choose approval tool (git/ServiceNow) for PR/ticket creation"
              /> */}
                  <Illustrations
                    iconClassname={
                      theme.palette.type === 'dark'
                        ? 'icon-choose-repositories-white'
                        : 'icon-choose-repositories-black'
                    }
                    iconText="Choose repositories you want to add"
                  />
                  <Illustrations
                    iconClassname={
                      theme.palette.type === 'dark'
                        ? 'icon-generate-cataloginfo-white'
                        : 'icon-generate-cataloginfo-black'
                    }
                    iconText="Generate a catalog-info.yaml file for each repository"
                  />
                  <Illustrations
                    iconClassname={
                      theme.palette.type === 'dark'
                        ? 'icon-edit-pullrequest-white'
                        : 'icon-edit-pullrequest-black'
                    }
                    iconText="Edit the pull request details if needed"
                  />
                  <Illustrations
                    iconClassname={
                      theme.palette.type === 'dark'
                        ? 'icon-track-status-white'
                        : 'icon-track-status-black'
                    }
                    iconText="Track the approval status"
                  />
                </AccordionDetails>
              </Accordion>
            </div>
            <DrawerContextProvider>
              <Formik
                initialValues={initialValues}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                <AddRepositoriesForm error={generalSubmitError} />
              </Formik>
            </DrawerContextProvider>
          </>
        ) : (
          <div style={{ padding: '24px' }}>
            <Alert severity="warning" data-testid="no-permission-alert">
              <AlertTitle>Permission required</AlertTitle>
              To add repositories, contact your administrator to give you the
              `bulk.import` permission.
            </Alert>
          </div>
        )}
      </Content>
    </Page>
  );
};
