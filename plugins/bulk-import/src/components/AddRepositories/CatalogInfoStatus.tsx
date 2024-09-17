import React from 'react';

import { StatusRunning } from '@backstage/core-components';

import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  RepositoryStatus,
} from '../../types';
import {
  areAllRowsSelected,
  getImportStatus,
} from '../../utils/repository-utils';
import { PreviewFile } from '../PreviewFile/PreviewFile';

export const CatalogInfoStatus = ({
  data,
  isItemSelected,
  alreadyAdded = 0,
  isLoading,
  isDrawer,
  importStatus,
}: {
  data: AddRepositoryData;
  isLoading?: boolean;
  alreadyAdded?: number;
  isItemSelected?: boolean;
  isDrawer?: boolean;
  importStatus?: string;
}) => {
  const { values, setFieldValue } =
    useFormikContext<AddRepositoriesFormValues>();

  React.useEffect(() => {
    if (importStatus === RepositoryStatus.ADDED) {
      setFieldValue(`excludedRepositories.${data.id}`, {
        repoId: data.id,
        orgName: data.orgName,
        status: importStatus,
      });
    }
  }, [data.id, importStatus, setFieldValue, data.repoName, data.orgName]);

  const isSelected =
    isItemSelected || Object.keys(data.selectedRepositories || {}).length > 0;
  const allSelected = areAllRowsSelected(
    values.repositoryType,
    alreadyAdded,
    isItemSelected,
    data?.totalReposInOrg || 0,
    data?.selectedRepositories || {},
  );

  if (
    !isDrawer &&
    (isSelected ||
      (data?.totalReposInOrg && data.totalReposInOrg > 0 && allSelected))
  ) {
    return <PreviewFile data={data} />;
  }

  if (!isDrawer && isLoading) {
    return (
      <StatusRunning>
        <span
          style={{ fontWeight: '400', fontSize: '0.875rem', color: '#181818' }}
        >
          Generating
        </span>
      </StatusRunning>
    );
  }

  if (importStatus) {
    return (
      <span style={{ color: '#6A6E73' }}>{getImportStatus(importStatus)}</span>
    );
  }

  if (isDrawer || data?.totalReposInOrg === 0) {
    return null;
  }

  return <span>Not Generated</span>;
};
