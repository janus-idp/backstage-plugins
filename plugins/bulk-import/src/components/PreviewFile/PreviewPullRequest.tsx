import * as React from 'react';

import { Link } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  PullRequestPreviewData,
  RepositoryStatus,
} from '../../types';
import { getCustomisedErrorMessage } from '../../utils/repository-utils';
import { PreviewPullRequestForm } from './PreviewPullRequestForm';

export const PreviewPullRequest = ({
  repoId,
  repoUrl,
  pullRequest,
  setPullRequest,
  formErrors,
  setFormErrors,
  others,
}: {
  repoId: string;
  repoUrl: string;
  repoBranch: string;
  pullRequest: PullRequestPreviewData;
  formErrors: PullRequestPreviewData;
  others?: {
    addPaddingTop?: boolean;
  };
  setPullRequest: (pullRequest: PullRequestPreviewData) => void;
  setFormErrors: (pullRequest: PullRequestPreviewData) => void;
}) => {
  const { status } = useFormikContext<AddRepositoriesFormValues>();

  const [entityOwner, setEntityOwner] = React.useState<string>('');

  const error = status?.errors?.[repoId];
  const info = status?.infos?.[repoId];
  if (
    info?.error?.message.includes(
      RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO,
    ) &&
    !error
  ) {
    // hide preview pull request form for this status
    return (
      <Box marginTop={others?.addPaddingTop ? 2 : 0}>
        <Alert severity="info">
          {getCustomisedErrorMessage(info.error.message).message}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Box marginTop={others?.addPaddingTop ? 2 : 0}>
          <Alert severity="error">
            <AlertTitle>
              {error.error?.title ? error.error?.title : 'Failed to create PR'}
            </AlertTitle>
            {getCustomisedErrorMessage(error.error.message).message}{' '}
            {error?.repository?.organization && error?.repository?.name && (
              <Link
                to={`https://github.com/${error.repository.organization}/${error.repository.name}`}
              >
                View repository
                <OpenInNewIcon
                  style={{ verticalAlign: 'sub', paddingTop: '7px' }}
                />
              </Link>
            )}
          </Alert>
          {!others?.addPaddingTop && <br />}
        </Box>
      )}
      {info && (
        <Box marginTop={others?.addPaddingTop ? 2 : 0}>
          <Alert severity="info" data-testid="other-info">
            {getCustomisedErrorMessage(info.error.message).message}{' '}
          </Alert>
          {!others?.addPaddingTop && <br />}
        </Box>
      )}
      {pullRequest[repoId]?.pullRequestUrl && (
        <Box marginTop={others?.addPaddingTop ? 2 : 0}>
          <Alert severity="info" data-testid="pull-request-info">
            The{' '}
            <Link to={pullRequest[repoId].pullRequestUrl || ''}>
              pull request
            </Link>{' '}
            is pending approval
          </Alert>
        </Box>
      )}
      <PreviewPullRequestForm
        entityOwner={entityOwner}
        setEntityOwner={setEntityOwner}
        repoId={repoId}
        repoUrl={repoUrl}
        pullRequest={pullRequest}
        setPullRequest={setPullRequest}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />
    </>
  );
};
