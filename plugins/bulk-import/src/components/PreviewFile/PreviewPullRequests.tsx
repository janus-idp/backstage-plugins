import * as React from 'react';

import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  PullRequestPreviewData,
} from '../../types/types';
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
      aria-labelledby={`preview-pullrequest-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
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
  setPullRequest: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
  formErrors: PullRequestPreviewData;
  setFormErrors: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
}) => {
  const [value, setValue] = React.useState(0);
  const { status } = useFormikContext<AddRepositoriesFormValues>();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
            const label = status?.[`${repo.id}`] ? (
              <span data-testid="pr-creation-failed">
                <ErrorOutline
                  color="error"
                  style={{ verticalAlign: 'sub', paddingTop: '7px' }}
                />{' '}
                {repo.repoName}
              </span>
            ) : (
              repo.repoName
            );
            return <Tab label={label} id={repo.repoName} key={repo.id} />;
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
            />
          </CustomTabPanel>
        );
      })}
    </Box>
  );
};
