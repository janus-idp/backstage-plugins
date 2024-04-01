import React from 'react';

import { useFormikContext } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  RepositorySelection,
  RepositoryStatus,
} from '../../types';
import { PreviewFile } from '../PreviewFile/PreviewFile';

export const CatalogInfoStatus = ({
  data,
  isItemSelected,
  alreadyAdded,
  isDrawer,
}: {
  data: AddRepositoriesData;
  alreadyAdded?: number;
  isItemSelected?: boolean;
  isDrawer?: boolean;
}) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  if (data.catalogInfoYaml?.status === RepositoryStatus.Exists) {
    return <span style={{ color: 'grey' }}>Repository already added</span>;
  }
  if (isDrawer) {
    return null;
  }
  const isSelected =
    isItemSelected ||
    (data.selectedRepositories && data.selectedRepositories.length > 0);
  const allSelected =
    values.repositoryType === RepositorySelection.Organization
      ? (data.selectedRepositories?.length || 0) + (alreadyAdded || 0) ===
        data.repositories?.length
      : !!isItemSelected;

  if (isSelected || allSelected) {
    return <PreviewFile data={data} repositoryType={values.repositoryType} />;
  }

  return <span>{RepositoryStatus.NotGenerated}</span>;
};
