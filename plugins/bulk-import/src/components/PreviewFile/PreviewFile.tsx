import * as React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import ReadyIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  PullRequestPreview,
  PullRequestPreviewData,
  RepositorySelection,
  RepositoryStatus,
  RepositoryType,
} from '../../types';
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
}: {
  open: boolean;
  data: AddRepositoriesData;
  repositoryType: RepositoryType;
  onClose: () => void;
  formErrors: any;
  setFormErrors: React.Dispatch<React.SetStateAction<any>>;
  handleSave: (pullRequest: PullRequestPreviewData, _event: any) => void;
}) => {
  const classes = useDrawerStyles();
  const [pullRequest, setPullRequest] = React.useState<PullRequestPreviewData>(
    {},
  );
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const contentClasses = useDrawerContentStyles();
  const initializePullRequest = React.useCallback(() => {
    const newPullRequestData: PullRequestPreviewData = {};

    if (
      data?.repositories?.length &&
      data?.repositories?.length > 0 &&
      data?.selectedRepositories?.length &&
      data.selectedRepositories?.length > 0
    ) {
      data.selectedRepositories.forEach(repo => {
        if (
          repo.repoName &&
          values.repositories?.[repo.repoName]?.catalogInfoYaml?.prTemplate
        ) {
          newPullRequestData[repo.repoName] = values.repositories[repo.repoName]
            .catalogInfoYaml?.prTemplate as PullRequestPreview;
        }
      });
    } else if (
      data?.repoName &&
      values.repositories?.[data.repoName]?.catalogInfoYaml?.prTemplate
    ) {
      newPullRequestData[data.repoName] = values.repositories[data.repoName]
        .catalogInfoYaml?.prTemplate as PullRequestPreview;
    }

    setPullRequest(newPullRequestData);
  }, [data, values]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initializePullRequest();
  }, [data, initializePullRequest]);

  const handleCancel = (_event: any) => {
    initializePullRequest();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      data-testid="preview-file-sidebar"
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
                  {`${data.orgName || data.organizationUrl}/${data.repoName}`}
                </Typography>
                <Link to={data.repoUrl || ''}>{data.repoUrl}</Link>
              </>
            ) : (
              <>
                <Typography variant="h5">{`${data.orgName}`}</Typography>
                <Link to={data.repoUrl || ''}>{data.organizationUrl}</Link>
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
          {repositoryType === RepositorySelection.Repository &&
            data.catalogInfoYaml?.prTemplate && (
              <PreviewPullRequest
                repoName={data.repoName || ''}
                pullRequest={pullRequest}
                setPullRequest={setPullRequest}
                formErrors={formErrors as PullRequestPreviewData}
                setFormErrors={
                  setFormErrors as React.Dispatch<
                    React.SetStateAction<PullRequestPreviewData>
                  >
                }
              />
            )}
          {repositoryType === RepositorySelection.Organization && (
            <PreviewPullRequests
              repositories={data.selectedRepositories || []}
              pullRequest={pullRequest}
              formErrors={formErrors as PullRequestPreviewData}
              setFormErrors={
                setFormErrors as React.Dispatch<
                  React.SetStateAction<PullRequestPreviewData>
                >
              }
              setPullRequest={setPullRequest}
            />
          )}

          <div className={contentClasses.footer}>
            <Button
              variant="contained"
              onClick={e => handleSave(pullRequest, e)}
              className={contentClasses.createButton}
              disabled={
                !!formErrors &&
                Object.values(formErrors).length > 0 &&
                Object.values(formErrors).every(
                  fe => !!fe && Object.values(fe).length > 0,
                )
              }
            >
              Save
            </Button>
            <Link to="" variant="button" onClick={handleCancel}>
              <Button variant="outlined">Cancel</Button>
            </Link>
          </div>
        </Box>
      </Box>
    </Drawer>
  );
};

export const PreviewFile = ({
  data,
  repositoryType,
}: {
  data: AddRepositoriesData;
  repositoryType: RepositoryType;
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();
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
        <ReadyIcon
          color="success"
          style={{ verticalAlign: 'sub', paddingTop: '7px' }}
        />
        {RepositoryStatus.Ready}{' '}
        <Link
          to=""
          onClick={() => setSidebarOpen(true)}
          data-testid={
            data?.selectedRepositories && data.selectedRepositories.length > 1
              ? 'preview-files'
              : 'preview-file'
          }
        >
          {data?.selectedRepositories && data.selectedRepositories.length > 1
            ? 'Preview files'
            : 'Preview file'}
        </Link>
      </span>
      <PreviewFileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        data={data}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        repositoryType={repositoryType}
        handleSave={handleSave}
      />
    </>
  );
};
