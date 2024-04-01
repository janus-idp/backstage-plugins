import React from 'react';

import { Content, Header, Page } from '@backstage/core-components';

import { useTheme } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { Formik } from 'formik';

import {
  AddRepositoriesFormValues,
  ApprovalTool,
  RepositorySelection,
} from '../../types';
import { AddRepositoriesForm } from './AddRepositoriesForm';
import { Illustrations } from './Illustrations';

export const AddRepositoriesPage = () => {
  const theme = useTheme();
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    approvalTool: ApprovalTool.Git,
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
                Add repositories to Red Hat Developer Hub in 5 steps
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
              <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-approval-tool-white'
                    : 'icon-approval-tool-black'
                }
                iconText="Choose approval tool (git/ServiceNow) for PR/ticket creation"
              />
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
          onSubmit={async (_values: AddRepositoriesFormValues) => {}}
        >
          <AddRepositoriesForm />
        </Formik>
      </Content>
    </Page>
  );
};
