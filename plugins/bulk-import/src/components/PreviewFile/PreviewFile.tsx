import * as React from 'react';

import { Link } from '@backstage/core-components';

import ReadyIcon from '@mui/icons-material/CheckOutlined';
import FailIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Tooltip from '@mui/material/Tooltip';
import { useFormikContext } from 'formik';

import { useDrawer } from '@janus-idp/shared-react';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ErrorType,
  RepositorySelection,
  RepositoryStatus,
} from '../../types';
import { getCustomisedErrorMessage } from '../../utils/repository-utils';

export const PreviewFile = ({ data }: { data: AddRepositoryData }) => {
  const { status, values } = useFormikContext<AddRepositoriesFormValues>();
  const { setOpenDrawer, setDrawerData } = useDrawer();
  const statusErrors = (status?.errors as ErrorType) || {};

  const errorMessage = getCustomisedErrorMessage(
    Object.values(statusErrors).find(s => s?.repository?.name === data.repoName)
      ?.error.message,
  );

  const openDrawer = (dd: AddRepositoryData) => {
    setDrawerData(dd);
    setOpenDrawer(true);
  };

  return (
    <>
      {Object.keys(statusErrors).length > 0 &&
      Object.values(statusErrors).find(
        s =>
          s?.repository?.name === data.repoName ||
          (values.repositoryType === RepositorySelection.Organization &&
            s?.repository?.organization === data.orgName),
      ) ? (
        <>
          <Tooltip
            title={
              values.repositoryType === RepositorySelection.Repository
                ? errorMessage.message
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
            to={errorMessage.showRepositoryLink ? data.repoUrl || '' : ''}
            onClick={() =>
              errorMessage.showRepositoryLink ? null : setOpenDrawer(true)
            }
            data-testid="edit-pull-request"
          >
            {errorMessage.showRepositoryLink ? (
              <>
                View repository{' '}
                <OpenInNewIcon
                  style={{ verticalAlign: 'sub', paddingTop: '7px' }}
                />{' '}
              </>
            ) : (
              'Edit'
            )}
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
            onClick={() => openDrawer(data)}
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
    </>
  );
};
