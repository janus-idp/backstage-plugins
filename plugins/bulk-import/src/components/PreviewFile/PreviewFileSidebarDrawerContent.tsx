import * as React from 'react';

import { Link } from '@backstage/core-components';

import { Button, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  AddRepositoryData,
  PullRequestPreviewData,
  RepositorySelection,
} from '../../types';
import { urlHelper } from '../../utils/repository-utils';
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
    backgroundColor: theme.palette.type === 'light' ? '#fff' : '#1b1d21',
    width: '100%',
    borderTopStyle: 'groove',
    border: theme.palette.divider,
    zIndex: 1,
  },
}));

export const PreviewFileSidebarDrawerContent = ({
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
