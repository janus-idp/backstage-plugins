import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { useFormikContext } from 'formik';
import yaml from 'js-yaml';
import { get } from 'lodash';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ApprovalTool,
  PullRequestPreviewData,
  RepositorySelection,
} from '../../types';
import { ImportJobResponse, ImportJobStatus } from '../../types/response-types';
import {
  getJobErrors,
  prepareDataForSubmission,
} from '../../utils/repository-utils';
import { PreviewFileSidebar } from '../PreviewFile/PreviewFileSidebar';

const EditCatalogInfo = ({
  importStatus,
  onClose,
  open,
}: {
  importStatus: ImportJobStatus;
  onClose: () => void;
  open: boolean;
}) => {
  const bulkImportApi = useApi(bulkImportApiRef);
  const { setSubmitting, setStatus, isSubmitting } =
    useFormikContext<AddRepositoriesFormValues>();
  let yamlContent = {} as Entity;
  try {
    yamlContent = yaml.loadAll(
      importStatus?.github?.pullRequest?.catalogInfoContent,
    )[0] as Entity;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    yamlContent = {} as Entity;
  }
  const catalogEntityName = yamlContent?.metadata?.name;
  const entityOwner = yamlContent?.spec?.owner as string;

  const previewData: AddRepositoryData = {
    id: importStatus?.repository?.id,
    repoUrl: importStatus?.repository?.url,
    repoName: importStatus?.repository?.name,
    orgName: importStatus?.repository?.organization,
    catalogInfoYaml: {
      prTemplate: {
        prTitle: importStatus?.github?.pullRequest?.title,
        prDescription: importStatus?.github?.pullRequest?.body,
        useCodeOwnersFile: !entityOwner,
        componentName: catalogEntityName,
        entityOwner,
        yaml: yamlContent,
      },
    },
  };

  const handleSave = async (
    pullRequest: PullRequestPreviewData,
    _event: any,
  ) => {
    const importRepositories = prepareDataForSubmission(
      {
        [`${importStatus.repository.id}`]: {
          id: importStatus.repository.id,
          catalogInfoYaml: {
            prTemplate: pullRequest[`${importStatus.repository.id}`],
          },
          defaultBranch: importStatus.repository?.defaultBranch,
          organizationUrl: importStatus.repository.url
            ?.substring(
              0,
              importStatus.repository.url?.indexOf(
                importStatus.repository.organization || '',
              ),
            )
            .concat(importStatus.repository.organization || ''),
          orgName: importStatus.repository?.organization,
          repoName: importStatus.repository.name,
          repoUrl: importStatus.repository.url,
        },
      },
      importStatus?.approvalTool as ApprovalTool,
    );
    try {
      setSubmitting(true);
      const dryrunResponse: ImportJobResponse[] =
        await bulkImportApi.createImportJobs(importRepositories, true);
      const dryRunErrors = getJobErrors(dryrunResponse);
      if (Object.keys(dryRunErrors?.errors || {}).length > 0) {
        setStatus(dryRunErrors);
        setSubmitting(false);
      } else {
        const createJobResponse: ImportJobResponse[] | Response =
          await bulkImportApi.createImportJobs(importRepositories);
        setSubmitting(true);
        if (!Array.isArray(createJobResponse)) {
          setStatus({
            [`${importStatus.repository.id}`]: {
              repository: importStatus.repository.name,
              catalogEntityName,
              error: {
                message:
                  get(createJobResponse, 'error.message') ||
                  'Failed to create pull request',
                status: get(createJobResponse, 'error.name') || 'Error occured',
              },
            },
          });
        } else {
          const createJobErrors = getJobErrors(createJobResponse);
          if (Object.keys(createJobErrors?.errors || {}).length > 0) {
            setStatus(createJobErrors);
          } else {
            onClose();
          }
        }
        setSubmitting(false);
      }
    } catch (error: any) {
      setStatus({
        [`${importStatus.repository.id}`]: {
          repository: importStatus.repository.name,
          catalogEntityName,
          error: {
            message: error?.message || 'Error occured',
            status: error?.name,
          },
        },
      });
      setSubmitting(false);
    }
  };

  return (
    <PreviewFileSidebar
      open={open}
      data={previewData}
      isSubmitting={isSubmitting}
      repositoryType={RepositorySelection.Repository}
      onClose={onClose}
      handleSave={handleSave}
    />
  );
};

export default EditCatalogInfo;
