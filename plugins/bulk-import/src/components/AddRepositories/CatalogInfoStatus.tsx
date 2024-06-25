import React from 'react';

import { StatusRunning } from '@backstage/core-components';

import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
} from '../../types/types';
import {
  areAllRowsSelected,
  getImportStatus,
  shouldExcludeRepositories,
} from '../../utils/repository-utils';
import { PreviewFile } from '../PreviewFile/PreviewFile';

export const CatalogInfoStatus = ({
  data,
  isItemSelected,
  alreadyAdded = 0,
  isLoading,
  isDrawer,
  importStatus,
  orgRepositoriesCount,
}: {
  data: AddRepositoryData;
  isLoading?: boolean;
  alreadyAdded?: number;
  isItemSelected?: boolean;
  isDrawer?: boolean;
  importStatus?: string;
  orgRepositoriesCount?: number;
}) => {
  const { values, setFieldValue } =
    useFormikContext<AddRepositoriesFormValues>();

  React.useEffect(() => {
    if (shouldExcludeRepositories(importStatus || '')) {
      setFieldValue(`excludedRepositories.${data.id}`, {
        status: importStatus,
      });
    }
  }, [data.id, importStatus, setFieldValue, data.repoName]);

  const isSelected =
    isItemSelected || Object.keys(data.selectedRepositories || {}).length > 0;
  const allSelected = areAllRowsSelected(
    values.repositoryType,
    alreadyAdded,
    isItemSelected,
    orgRepositoriesCount || 0,
    data?.selectedRepositories || {},
  );

  if (
    !isDrawer &&
    (isSelected ||
      (orgRepositoriesCount && orgRepositoriesCount > 0 && allSelected))
  ) {
    return <PreviewFile data={data} repositoryType={values.repositoryType} />;
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

  if (
    values?.repositories?.[data.id]?.catalogInfoYaml?.status ||
    importStatus
  ) {
    return (
      <span style={{ color: '#6A6E73' }}>
        {getImportStatus(
          (values?.repositories?.[data.id]?.catalogInfoYaml?.status ||
            importStatus) as string,
        )}
      </span>
    );
  }

  if (isDrawer || orgRepositoriesCount === 0) {
    return null;
  }

  return <span>Not Generated</span>;
};
