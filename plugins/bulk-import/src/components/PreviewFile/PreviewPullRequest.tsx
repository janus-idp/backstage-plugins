import * as React from 'react';
import { useAsync } from 'react-use';

import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Alert, AlertTitle } from '@material-ui/lab';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  ImportJobStatus,
  PullRequestPreviewData,
} from '../../types';
import { getCustomisedErrorMessage } from '../../utils/repository-utils';
import { PreviewPullRequestForm } from './PreviewPullRequestForm';

export const PreviewPullRequest = ({
  repoId,
  repoUrl,
  repoBranch,
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
  const bulkImportApi = useApi(bulkImportApiRef);
  const { value: repoStatus } = useAsync(async () => {
    const result = await bulkImportApi.getImportAction(
      repoUrl || '',
      repoBranch || 'main',
    );
    return result;
  });

  const [entityOwner, setEntityOwner] = React.useState<string>('');

  const error = status?.errors?.[repoId];
  const info = status?.infos?.[repoId];
  if (info && !error) {
    // prioritize error over info
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
            <AlertTitle>Failed to create PR</AlertTitle>
            {getCustomisedErrorMessage(error.error.message).message}{' '}
            <Link
              to={`https://github.com/${error.repository.organization}/${error.repository.name}`}
            >
              View repository
              <OpenInNewIcon
                style={{ verticalAlign: 'sub', paddingTop: '7px' }}
              />
            </Link>
          </Alert>
        </Box>
      )}
      {(repoStatus as ImportJobStatus)?.github?.pullRequest?.url && (
        <Box marginTop={others?.addPaddingTop ? 2 : 0}>
          <Alert severity="info" data-testid="pull-request-info">
            The{' '}
            <Link to={(repoStatus as ImportJobStatus).github.pullRequest.url}>
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
