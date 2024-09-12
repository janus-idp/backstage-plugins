import * as React from 'react';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import { Drawer, makeStyles } from '@material-ui/core';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ImportJobStatus,
  PullRequestPreview,
  PullRequestPreviewData,
  RepositoryStatus,
  RepositoryType,
} from '../../types';
import {
  evaluatePRTemplate,
  getPRTemplate,
} from '../../utils/repository-utils';
import { PreviewFileSidebarDrawerContent } from './PreviewFileSidebarDrawerContent';

const useDrawerStyles = makeStyles(theme => ({
  paper: {
    width: '40%',
    gap: '3%',
  },
  body: {
    padding: theme.spacing(2.5),
  },
}));

export const PreviewFileSidebar = ({
  open,
  onClose,
  repositoryType,
  data,
  handleSave,
  isSubmitting,
}: {
  open: boolean;
  data: AddRepositoryData;
  repositoryType: RepositoryType;
  onClose: () => void;
  handleSave: (pullRequest: PullRequestPreviewData, _event: any) => void;
  isSubmitting?: boolean;
}) => {
  const { setStatus, status } = useFormikContext<AddRepositoriesFormValues>();
  const classes = useDrawerStyles();
  const bulkImportApi = useApi(bulkImportApiRef);
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);
  const [pullRequest, setPullRequest] = React.useState<PullRequestPreviewData>(
    {},
  );
  const [isInitialized, setIsInitialized] = React.useState(false);

  const fetchPullRequestData = async (
    id: string,
    repoName: string,
    orgName: string,
    url: string,
    branch: string,
    repoPrTemplate: PullRequestPreview,
  ) => {
    const result = await bulkImportApi.getImportAction(
      url || '',
      branch || 'main',
    );
    if ((result as Response)?.statusText) {
      setStatus({
        ...status,
        errors: {
          ...(status?.errors || {}),
          [data.id]: {
            error: {
              title: (result as Response)?.statusText,
              message: [
                `Failed to fetch the pull request. A new YAML has been generated below.`,
              ],
            },
          },
        },
      });
      return repoPrTemplate;
    } else if (
      (result as ImportJobStatus)?.status === RepositoryStatus.WAIT_PR_APPROVAL
    ) {
      const importJobResult = result as ImportJobStatus;
      const evaluatedPRTemplate = evaluatePRTemplate(importJobResult);
      let pullReqPreview = { ...evaluatedPRTemplate.pullReqPreview };

      if (evaluatedPRTemplate.isInvalidEntity) {
        const identityRef = await identityApi.getBackstageIdentity();
        const baseUrl = configApi.getString('app.baseUrl');
        const prTemp = getPRTemplate(
          repoName,
          orgName,
          identityRef.userEntityRef || 'user:default/guest',
          baseUrl as string,
          url,
          branch,
        );
        delete prTemp.prDescription;
        delete prTemp.prTitle;

        setStatus({
          ...status,
          infos: {
            ...(status?.infos || {}),
            [id]: {
              error: {
                message: [
                  `The entity YAML in your pull request is invalid (empty file or missing apiVersion, kind, or metadata.name). A new YAML has been generated below.`,
                ],
              },
            },
          },
        });
        pullReqPreview = {
          ...prTemp,
          prDescription: pullReqPreview.prDescription || '',
          prTitle: pullReqPreview.prTitle || '',
        };
      }
      return pullReqPreview;
    }
    return repoPrTemplate;
  };

  const initializePullRequest = React.useCallback(async () => {
    const newPullRequestData: PullRequestPreviewData = {};
    if (Object.keys(data?.selectedRepositories || [])?.length > 0) {
      for (const repo of Object.values(data?.selectedRepositories || [])) {
        newPullRequestData[repo.id] = await fetchPullRequestData(
          repo.id,
          repo.repoName || '',
          repo.orgName || '',
          repo.repoUrl || '',
          repo.defaultBranch || 'main',
          repo.catalogInfoYaml?.prTemplate as PullRequestPreview,
        );
      }
    } else {
      newPullRequestData[data.id] = await fetchPullRequestData(
        data.id,
        data.repoName || '',
        data.orgName || '',
        data.repoUrl || '',
        data.defaultBranch || 'main',
        data.catalogInfoYaml?.prTemplate as PullRequestPreview,
      );
    }
    setPullRequest(newPullRequestData);
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, bulkImportApi, setStatus, status]);

  React.useEffect(() => {
    if (!isInitialized && data?.id) {
      initializePullRequest();
    }
  }, [isInitialized, data?.id, initializePullRequest]);

  const handleCancel = () => {
    initializePullRequest(); // reset any unsaved changes
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      data-testid={
        !isInitialized
          ? 'preview-pullrequest-sidebar-loading'
          : 'preview-pullrequest-sidebar'
      }
      classes={{
        paper: classes.paper,
      }}
    >
      <PreviewFileSidebarDrawerContent
        repositoryType={repositoryType}
        onCancel={handleCancel}
        isLoading={!isInitialized}
        isSubmitting={isSubmitting}
        data={data}
        pullRequest={pullRequest}
        onSave={handleSave}
        setPullRequest={setPullRequest}
      />
    </Drawer>
  );
};
