import React from 'react';

import { Content, Header, Page } from '@backstage/core-components';

import { makeStyles, useTheme } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';

import { AddRepositoriesFormValues } from '../../types';
import { AddRepositoriesForm } from './AddRepositoriesForm';
import { AddRepositoriesFormFooter } from './AddRepositoriesFormFooter';
import { Illustrations } from './Illustrations';

const useStyles = makeStyles(() => ({
  illustration: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    overflow: 'scroll',
  },
}));

export const AddRepositoriesPage = () => {
  const styles = useStyles();
  const theme = useTheme();
  const [approvalTool, setApprovalTool] = React.useState<'git' | 'servicenow'>(
    'git',
  );
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: 'repository',
    repositories: [],
    organizations: [],
    approvalTool: 'git',
  };

  const formik = useFormik<AddRepositoriesFormValues>({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (_values: AddRepositoriesFormValues) => {},
  });

  return (
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content>
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
            id="add-repository-illustrations"
            className={styles.illustration}
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
        <br />
        <AddRepositoriesForm
          values={formik.values}
          setFieldValue={formik.setFieldValue}
          setapprovalTool={setApprovalTool}
        />
      </Content>
      <AddRepositoriesFormFooter
        approvalTool={approvalTool}
        handleSubmit={formik.handleSubmit}
        values={formik.values}
      />
    </Page>
  );
};
