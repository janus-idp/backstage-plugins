import * as React from 'react';

import ErrorOutline from '@mui/icons-material/ErrorOutline';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  PullRequestPreviewData,
} from '../../types';
import { PreviewPullRequest } from './PreviewPullRequest';

const CustomTabPanel = ({
  children,
  value,
  index,
  ...other
}: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preview-pullrequest-panel-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
};

const getLabel = (status: any, repoId: string, repoName: string) => {
  if (status?.errors?.[`${repoId}`]) {
    return (
      <span data-testid="pr-creation-failed">
        <ErrorOutline
          color="error"
          style={{ verticalAlign: 'sub', paddingTop: '7px' }}
        />{' '}
        {repoName}
      </span>
    );
  }
  if (status?.infos?.[`${repoId}`]) {
    return (
      <span data-testid="info-message">
        <InfoOutlined
          color="info"
          style={{ verticalAlign: 'sub', paddingTop: '7px' }}
        />{' '}
        {repoName}
      </span>
    );
  }
  return repoName;
};

export const PreviewPullRequests = ({
  repositories,
  pullRequest,
  setPullRequest,
  formErrors,
  setFormErrors,
}: {
  repositories: AddRepositoryData[];
  pullRequest: PullRequestPreviewData;
  setPullRequest: (pullRequest: PullRequestPreviewData) => void;
  formErrors: PullRequestPreviewData;
  setFormErrors: (pullRequest: PullRequestPreviewData) => void;
}) => {
  const [value, setValue] = React.useState(0);
  const { status } = useFormikContext<AddRepositoriesFormValues>();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (Object.values(repositories || []).length === 1) {
    return (
      <PreviewPullRequest
        repoName={Object.values(repositories)[0].id || ''}
        pullRequest={pullRequest}
        setPullRequest={setPullRequest}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="preview-pull-requests"
        >
          {repositories.map((repo: AddRepositoryData) => {
            return (
              <Tab
                label={getLabel(status, repo.id, repo?.repoName || '')}
                id={repo.repoName}
                key={repo.id}
              />
            );
          })}
        </Tabs>
      </Box>
      {Object.values(repositories).map((repo: AddRepositoryData, index) => {
        return (
          <CustomTabPanel value={value} index={index} key={repo.id}>
            <PreviewPullRequest
              repoName={repo.id || ''}
              pullRequest={pullRequest}
              setPullRequest={setPullRequest}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              others={{ addPaddingTop: true }}
            />
          </CustomTabPanel>
        );
      })}
    </Box>
  );
};
