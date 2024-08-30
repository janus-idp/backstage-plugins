import * as React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import ReadyIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FailIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ErrorType,
  PullRequestPreviewData,
  RepositorySelection,
  RepositoryStatus,
  RepositoryType,
} from '../../types';
import {
  getCustomisedErrorMessage,
  urlHelper,
} from '../../utils/repository-utils';
import { PreviewPullRequest } from './PreviewPullRequest';
import { PreviewPullRequests } from './PreviewPullRequests';

const useDrawerStyles = makeStyles(() => ({
  paper: {
    width: '40%',
    gap: '3%',
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

export const PreviewFileSidebar = ({
  open,
  onClose,
  repositoryType,
  data,
  formErrors,
  setFormErrors,
  handleSave,
  isSubmitting,
}: {
  open: boolean;
  data: AddRepositoryData;
  repositoryType: RepositoryType;
  onClose: () => void;
  formErrors: PullRequestPreviewData;
  isSubmitting?: boolean;
  setFormErrors: (formErr: PullRequestPreviewData) => void;
  handleSave: (pullRequest: PullRequestPreviewData, _event: any) => void;
}) => {
  const classes = useDrawerStyles();
  const [pullRequest, setPullRequest] = React.useState<PullRequestPreviewData>(
    {},
  );
  const [isInitialized, setIsInitialized] = React.useState(false);

  const contentClasses = useDrawerContentStyles();
  const initializePullRequest = React.useCallback(() => {
    const newPullRequestData: PullRequestPreviewData = {};

    if (Object.keys(data?.selectedRepositories || [])?.length > 0) {
      Object.values(data?.selectedRepositories || []).forEach(repo => {
        if (repo.catalogInfoYaml?.prTemplate) {
          newPullRequestData[repo.id] = repo.catalogInfoYaml.prTemplate;
        }
      });
    } else if (data.catalogInfoYaml?.prTemplate) {
      newPullRequestData[data.id] = data.catalogInfoYaml?.prTemplate;
    }

    setPullRequest(newPullRequestData);
    setIsInitialized(true);
  }, [data]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isInitialized) {
      initializePullRequest();
    }
  }, [isInitialized, initializePullRequest]);

  const handleCancel = (_event: any) => {
    initializePullRequest();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      data-testid="preview-pullrequest-sidebar"
      classes={{
        paper: classes.paper,
      }}
    >
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
            onClick={onClose}
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
              pullRequest={pullRequest}
              setPullRequest={setPullRequest}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
            />
          )}
          {repositoryType === RepositorySelection.Organization && (
            <PreviewPullRequests
              repositories={
                Object.values(data?.selectedRepositories || []) || []
              }
              pullRequest={pullRequest}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              setPullRequest={setPullRequest}
            />
          )}
        </Box>
      </Box>
      <div className={contentClasses.footer}>
        <Button
          variant="contained"
          onClick={e => handleSave(pullRequest, e)}
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
        <Link to="" variant="button" onClick={handleCancel}>
          <Button variant="outlined">Cancel</Button>
        </Link>
      </div>
    </Drawer>
  );
};

export const PreviewFile = ({
  data,
  repositoryType,
}: {
  data: AddRepositoryData;
  repositoryType: RepositoryType;
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  const { setFieldValue, status } =
    useFormikContext<AddRepositoriesFormValues>();
  const [formErrors, setFormErrors] = React.useState<PullRequestPreviewData>();
  const handleSave = (pullRequest: PullRequestPreviewData, _event: any) => {
    Object.keys(pullRequest).forEach(pr => {
      setFieldValue(
        `repositories.${pr}.catalogInfoYaml.prTemplate`,
        pullRequest[pr],
      );
    });
    setSidebarOpen(false);
  };

  return (
    <>
      <span>
        {Object.keys(status?.errors || {}).length > 0 &&
        Object.values(status.errors as ErrorType).find(
          s =>
            s?.repository?.name === data.repoName ||
            (repositoryType === RepositorySelection.Organization &&
              s?.repository?.organization === data.orgName),
        ) ? (
          <>
            <Tooltip
              title={
                repositoryType === RepositorySelection.Repository
                  ? getCustomisedErrorMessage(
                      Object.values(status.errors as ErrorType).find(
                        s => s?.repository?.name === data.repoName,
                      )?.error.message || null,
                    )
                  : 'PR creation was unsuccessful for some repositories. Click on `Edit` to see the reason.'
              }
            >
              <FailIcon
                color="error"
                style={{ verticalAlign: 'sub', paddingTop: '7px' }}
              />
            </Tooltip>
            <span data-testid="failed"> Failed to create PR </span>
            <Link
              to=""
              onClick={() => setSidebarOpen(true)}
              data-testid="edit-pull-request"
            >
              Edit
            </Link>
          </>
        ) : (
          <>
            <ReadyIcon
              color="success"
              style={{ verticalAlign: 'sub', paddingTop: '7px' }}
            />
            {RepositoryStatus.Ready}{' '}
            <Link
              to=""
              onClick={() => setSidebarOpen(true)}
              data-testid={
                Object.keys(data?.selectedRepositories || []).length > 1
                  ? 'preview-files'
                  : 'preview-file'
              }
            >
              {Object.keys(data?.selectedRepositories || []).length > 1
                ? 'Preview files'
                : 'Preview file'}
            </Link>
          </>
        )}
      </span>
      <PreviewFileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        data={data}
        formErrors={formErrors as PullRequestPreviewData}
        setFormErrors={setFormErrors}
        repositoryType={repositoryType}
        handleSave={handleSave}
      />
    </>
  );
};
