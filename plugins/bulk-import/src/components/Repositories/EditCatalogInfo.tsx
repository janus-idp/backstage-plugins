import React, { useState } from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  PullRequestPreviewData,
} from '../../types';
import { PreviewFileSidebar } from '../PreviewFile/PreviewFile';

const EditCatalogInfo = ({ data }: { data: AddRepositoryData }) => {
  const hasPermission = false;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();
  const [formErrors, setFormErrors] = React.useState<PullRequestPreviewData>();

  const handleClick = () => {
    setDrawerOpen(true);
  };

  const handleSave = (pullRequest: PullRequestPreviewData, _event: any) => {
    Object.keys(pullRequest).forEach(pr => {
      setFieldValue(
        `repositories.${pr}.catalogInfoYaml.prTemplate`,
        pullRequest[pr],
      );
    });
    setDrawerOpen(false);
  };

  return (
    <>
      <Tooltip
        title={
          hasPermission
            ? 'Edit catalog-info.yaml'
            : 'View catalog-info.yaml file'
        }
      >
        <span
          data-testid={
            hasPermission ? 'edit-catalog-info' : 'view-catalog-info'
          }
        >
          {hasPermission ? (
            <IconButton
              color="inherit"
              aria-label="Update"
              onClick={() => handleClick()}
            >
              <EditIcon />
            </IconButton>
          ) : (
            <IconButton
              target="_blank"
              href={data.catalogInfoYaml?.pullRequest || ''}
              color="inherit"
              aria-label="Update"
            >
              <OpenInNewIcon />
            </IconButton>
          )}
        </span>
      </Tooltip>
      {hasPermission && (
        <PreviewFileSidebar
          open={drawerOpen}
          data={data}
          repositoryType="repository"
          onClose={() => setDrawerOpen(false)}
          handleSave={handleSave}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
      )}
    </>
  );
};

export default EditCatalogInfo;
