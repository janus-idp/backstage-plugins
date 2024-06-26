import React, { useState } from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  PullRequestPreviewData,
} from '../../types';
import { PreviewFileSidebar } from '../PreviewFile/PreviewFile';

type EditCatalogInfoProps = {
  data: AddRepositoriesData;
};

const EditCatalogInfo = ({ data }: EditCatalogInfoProps) => {
  const hasPermission = true;
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
        <span data-testid="edit-catalog-info">
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
              href={data.repoUrl || ''}
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
