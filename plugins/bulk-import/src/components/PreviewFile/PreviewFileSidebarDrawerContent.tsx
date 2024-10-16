import * as React from 'react';

import { Link } from '@backstage/core-components';

import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
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

  if (isLoading) {
    return (
      <Stack spacing={5} sx={{ p: 2.5 }}>
        <span style={{ display: 'flex', height: '10%' }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onCancel}
            color="inherit"
            size="large"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </span>
        <Skeleton variant="rectangular" width="100%" height={750} />
        <Skeleton variant="rectangular" width="100%" height="10%" />
      </Stack>
    );
  }
  return (
    <>
      <Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            p: 2.5, // padding: theme.spacing(2.5)
          }}
        >
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
            size="large"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2.5, // padding: theme.spacing(2.5)
            pt: 1, // paddingTop: theme.spacing(1)
            pb: 1, // paddingBottom: theme.spacing(1)
            mb: '100px', // marginBottom: '100px'
            flexGrow: 1, // flex-grow: 1
          }}
        >
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '14px',
          pt: 2.5, // paddingTop: theme.spacing(2.5)
          justifyContent: 'left',
          position: 'fixed',
          bottom: 0,
          pl: '24px', // paddingLeft: '24px'
          pb: '24px', // paddingBottom: '24px'
          backgroundColor: theme =>
            theme.palette.mode === 'light' ? '#fff' : '#1b1d21',
          width: '100%',
          borderTopStyle: 'groove',
          borderColor: 'divider', // using theme.palette.divider for border
          zIndex: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={e => onSave(pullRequest, e)}
          sx={{ mr: 1 }}
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
      </Box>
    </>
  );
};
