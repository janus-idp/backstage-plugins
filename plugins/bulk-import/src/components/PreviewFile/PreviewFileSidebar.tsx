import * as React from 'react';

import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Button, Drawer, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoryData,
  ImportJobStatus,
  PullRequestPreview,
  PullRequestPreviewData,
  RepositorySelection,
  RepositoryStatus,
  RepositoryType,
} from '../../types';
import { evaluatePRTemplate, urlHelper } from '../../utils/repository-utils';
import { PreviewPullRequest } from './PreviewPullRequest';
import { PreviewPullRequests } from './PreviewPullRequests';

const useDrawerStyles = makeStyles(theme => ({
  paper: {
    width: '40%',
    gap: '3%',
  },
  body: {
    padding: theme.spacing(2.5),
  },
}));

const useDrawerContentStyles = makeStyles(theme => ({
  createButton: {
    marginRight: theme.spacing(1),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: theme.spacing(2.5),
  },
  body: {
    padding: theme.spacing(2.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginBottom: '100px',
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: '14px',
    paddingTop: theme.spacing(2.5),
    display: 'flex',
    justifyContent: 'left',
    position: 'fixed',
    bottom: 0,
    paddingLeft: '24px',
    paddingBottom: '24px',
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    borderTopStyle: 'groove',
    border: theme.palette.divider,
    zIndex: 1,
  },
}));

const DrawerContent = ({
  repositoryType,
  onCancel,
  isLoading,
  isSubmitting,
  data,
  pullRequest,
  onSave,
  setPullRequest,
}: {
  repositoryType: string;
  onCancel: () => void;
  isLoading: boolean;
  isSubmitting: boolean | undefined;
  data: AddRepositoryData;
  pullRequest: PullRequestPreviewData;
  onSave: (pullRequest: PullRequestPreviewData, _event: any) => void;

  setPullRequest: (pullRequest: PullRequestPreviewData) => void;
}) => {
  const [formErrors, setFormErrors] = React.useState<PullRequestPreviewData>();
  const classes = useDrawerStyles();
  const contentClasses = useDrawerContentStyles();

  if (isLoading) {
    return (
      <Stack spacing={5} className={classes.body}>
        <span style={{ display: 'flex', height: '10%' }}>
          <Skeleton variant="rect" width="100%" height="100%" />
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onCancel}
            color="inherit"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </span>
        <Skeleton variant="rect" width="100%" height={750} />
        <Skeleton variant="rect" width="100%" height="10%" />
      </Stack>
    );
  }
  return (
    <>
      <Box>
        <Box className={contentClasses.header}>
          <div>
            {repositoryType === RepositorySelection.Repository ? (
              <>
                <Typography variant="h5">
                  {`${data.orgName ?? data.organizationUrl}/${data.repoName}`}
                </Typography>
                <Link to={data.repoUrl ?? ''}>
                  {urlHelper(data.repoUrl || '')}
                  <OpenInNewIcon
                    style={{ verticalAlign: 'sub', paddingTop: '7px' }}
                  />
                </Link>
              </>
            ) : (
              <>
                <Typography variant="h5">{`${data.orgName}`}</Typography>
                <Link to={data.organizationUrl ?? ''}>
                  {urlHelper(data.organizationUrl || '')}
                  <OpenInNewIcon
                    style={{ verticalAlign: 'sub', paddingTop: '7px' }}
                  />
                </Link>
              </>
            )}
          </div>

          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onCancel}
            color="inherit"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className={contentClasses.body}>
          {repositoryType === RepositorySelection.Repository && (
            <PreviewPullRequest
              repoId={data.id}
              repoUrl={data.repoUrl || ''}
              repoBranch={data.defaultBranch || 'main'}
              pullRequest={pullRequest}
              setPullRequest={setPullRequest}
              formErrors={formErrors as PullRequestPreviewData}
              setFormErrors={setFormErrors}
            />
          )}
          {repositoryType === RepositorySelection.Organization && (
            <PreviewPullRequests
              repositories={
                Object.values(data?.selectedRepositories || []) || []
              }
              pullRequest={pullRequest}
              formErrors={formErrors as PullRequestPreviewData}
              setFormErrors={setFormErrors}
              setPullRequest={setPullRequest}
            />
          )}
        </Box>
      </Box>
      <div className={contentClasses.footer}>
        <Button
          variant="contained"
          color="primary"
          onClick={e => onSave(pullRequest, e)}
          className={contentClasses.createButton}
          disabled={
            isSubmitting ||
            (!!formErrors &&
              Object.values(formErrors).length > 0 &&
              Object.values(formErrors).every(
                fe => !!fe && Object.values(fe).length > 0,
              ))
          }
          startIcon={
            isSubmitting && <CircularProgress size="20px" color="inherit" />
          }
        >
          Save
        </Button>
        <Link to="" variant="button" onClick={onCancel}>
          <Button variant="outlined">Cancel</Button>
        </Link>
      </div>
    </>
  );
};

export const PreviewFileSidebar = ({
  open,
  onClose,
  repositoryType,
  data,
  handleSave,
  isSubmitting,
}: {
  open: boolean;
  data: AddRepositoryData;
  repositoryType: RepositoryType;
  onClose: () => void;
  handleSave: (pullRequest: PullRequestPreviewData, _event: any) => void;
  isSubmitting?: boolean;
}) => {
  const classes = useDrawerStyles();
  const bulkImportApi = useApi(bulkImportApiRef);
  const [pullRequest, setPullRequest] = React.useState<PullRequestPreviewData>(
    {},
  );
  const [isInitialized, setIsInitialized] = React.useState(false);

  const initializePullRequest = React.useCallback(async () => {
    const newPullRequestData: PullRequestPreviewData = {};
    if (Object.keys(data?.selectedRepositories || [])?.length > 0) {
      for (const repo of Object.values(data?.selectedRepositories || [])) {
        const result = await bulkImportApi.getImportAction(
          repo.repoUrl || '',
          repo.defaultBranch || 'main',
        );
        if (
          (result as ImportJobStatus)?.status ===
          RepositoryStatus.WAIT_PR_APPROVAL
        ) {
          const prTemplate = evaluatePRTemplate(result as ImportJobStatus);
          newPullRequestData[repo.id] = prTemplate;
        } else {
          newPullRequestData[repo.id] = repo.catalogInfoYaml
            ?.prTemplate as PullRequestPreview;
        }
      }
    } else {
      const result = await bulkImportApi.getImportAction(
        data.repoUrl || '',
        data.defaultBranch || 'main',
      );
      if (
        (result as ImportJobStatus)?.status ===
        RepositoryStatus.WAIT_PR_APPROVAL
      ) {
        const prTemplate = evaluatePRTemplate(result as ImportJobStatus);
        newPullRequestData[data.id] = prTemplate;
      } else {
        newPullRequestData[data.id] = data.catalogInfoYaml
          ?.prTemplate as PullRequestPreview;
      }
    }

    setPullRequest(newPullRequestData);
    setIsInitialized(true);
  }, [data, bulkImportApi]);

  React.useEffect(() => {
    if (!isInitialized && data?.id) {
      initializePullRequest();
    }
  }, [isInitialized, data?.id, initializePullRequest]);

  const handleCancel = () => {
    initializePullRequest(); // reset any unsaved changes
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      data-testid={
        !isInitialized
          ? 'preview-pullrequest-sidebar-loading'
          : 'preview-pullrequest-sidebar'
      }
      classes={{
        paper: classes.paper,
      }}
    >
      <DrawerContent
        repositoryType={repositoryType}
        onCancel={handleCancel}
        isLoading={!isInitialized}
        isSubmitting={isSubmitting}
        data={data}
        pullRequest={pullRequest}
        onSave={handleSave}
        setPullRequest={setPullRequest}
      />
    </Drawer>
  );
};
