import * as React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { AddRepositoriesData, PullRequestPreviewData } from '../../types';
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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
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
  repositories: AddRepositoriesData[];
  pullRequest: PullRequestPreviewData;
  setPullRequest: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
  formErrors: PullRequestPreviewData;
  setFormErrors: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
}) => {
  const [value, setValue] = React.useState(0);

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
          {repositories.map((repo: AddRepositoriesData) => {
            return (
              <Tab label={repo.repoName} id={repo.repoName} key={repo.id} />
            );
          })}
        </Tabs>
      </Box>
      {Object.values(repositories).map((repo: AddRepositoriesData, index) => {
        return (
          <CustomTabPanel value={value} index={index} key={repo.id}>
            <PreviewPullRequest
              repoName={repo.repoName || ''}
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
