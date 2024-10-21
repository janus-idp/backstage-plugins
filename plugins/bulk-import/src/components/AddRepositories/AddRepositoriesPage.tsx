import React from 'react';

import { Content, Header, Page, Progress } from '@backstage/core-components';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

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
  const queryClientRef = React.useRef<QueryClient>();
  const theme = useTheme();
  const classes = useStyles();

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

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
          <QueryClientProvider client={queryClientRef.current as QueryClient}>
            <AddRepositoriesForm />
          </QueryClientProvider>
        </>
      );
    }
    return (
      <div style={{ padding: '24px' }}>
        <Alert severity="warning" data-testid="no-permission-alert">
          <AlertTitle>Permission required</AlertTitle>
          To add repositories, contact your administrator to give you the
          `bulk.import` permission.
        </Alert>
      </div>
    );
  };

  return (
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content noPadding>{showContent()}</Content>
    </Page>
  );
};
