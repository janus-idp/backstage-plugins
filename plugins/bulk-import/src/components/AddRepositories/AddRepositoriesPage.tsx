import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { useTheme } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { Formik, FormikHelpers } from 'formik';
import { get } from 'lodash';
import * as yaml from 'yaml';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { ImportJobResponse } from '../../types/response-types';
import {
  AddRepositoriesFormValues,
  ApprovalTool,
  CreateImportJobRepository,
  RepositorySelection,
} from '../../types/types';
import { getJobErrors } from '../../utils/repository-utils';
import { AddRepositoriesForm } from './AddRepositoriesForm';
import { Illustrations } from './Illustrations';

export const AddRepositoriesPage = () => {
  const theme = useTheme();
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

  const handleSubmit = async (
    values: AddRepositoriesFormValues,
    formikHelpers: FormikHelpers<AddRepositoriesFormValues>,
  ) => {
    formikHelpers.setSubmitting(true);
    formikHelpers.setStatus(null);
    const importRepositories = Object.values(values.repositories).reduce(
      (acc: CreateImportJobRepository[], repo) => {
        acc.push({
          approvalTool: values.approvalTool.toLocaleUpperCase(),
          catalogEntityName:
            repo.catalogInfoYaml?.prTemplate?.componentName ||
            repo?.repoName ||
            'my-component',
          repository: {
            url: repo.repoUrl || '',
            name: repo.repoName || '',
            organization: repo.orgName || '',
            defaultBranch: repo.defaultBranch || '',
          },
          catalogInfoContent: yaml.stringify(
            repo.catalogInfoYaml?.prTemplate?.yaml,
            null,
            2,
          ),
          github: {
            pullRequest: {
              title:
                repo.catalogInfoYaml?.prTemplate?.prTitle ||
                'Add catalog-info.yaml config file',
              body:
                repo.catalogInfoYaml?.prTemplate?.prDescription ||
                'This pull request adds a **Backstage entity metadata file**\nto this repository so that the component can\nbe added to the [software catalog](http://localhost:3000).\nAfter this pull request is merged, the component will become available.\nFor more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).',
            },
          },
        });
        return acc;
      },
      [],
    );
    bulkImportApi
      .createImportJobs(importRepositories, true)
      .then(async (dryrunResponse: ImportJobResponse[]) => {
        formikHelpers.setSubmitting(true);

        const dryRunErrors = getJobErrors(dryrunResponse);
        if (Object.keys(dryRunErrors).length > 0) {
          formikHelpers.setStatus(dryRunErrors);
        } else {
          bulkImportApi
            .createImportJobs(importRepositories)
            .then((createJobResponse: ImportJobResponse[] | Response) => {
              formikHelpers.setSubmitting(true);
              if (!Array.isArray(createJobResponse)) {
                setGeneralSubmitError({
                  message:
                    get(createJobResponse, 'error.message') ||
                    'Failed to create pull request',
                  title:
                    get(createJobResponse, 'error.name') || 'Error occured',
                });
                formikHelpers.setSubmitting(false);
              } else {
                const createJobErrors = getJobErrors(createJobResponse);
                if (Object.keys(createJobErrors).length > 0) {
                  formikHelpers.setStatus(createJobErrors);
                  formikHelpers.setSubmitting(false);
                } else {
                  navigate(`../bulk-import/repositories`);
                }
              }
            })
            .catch((err: Error) => {
              setGeneralSubmitError({
                message: err?.message || 'Error occured',
                title: err?.name,
              });
              formikHelpers.setSubmitting(false);
            });
        }
      })
      .catch((err: Error) => {
        setGeneralSubmitError({
          message: err?.message || 'Error occured',
          title: err?.name,
        });
        formikHelpers.setSubmitting(false);
      });
  };

  return (
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content noPadding>
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
            <AccordionDetails
              sx={{
                flexDirection: 'row',
                display: 'flex',
                justifyContent: 'space-around',
                overflow: 'auto',
              }}
            >
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
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          <AddRepositoriesForm error={generalSubmitError} />
        </Formik>
      </Content>
    </Page>
  );
};
