import React from 'react';
import { ContentHeader, SupportButton, Tabs } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { TrainingCard } from './TrainingCard';
import { mockRecentTraining } from './mock/mockTraining';
import { TrainingHistory } from './TrainingHistory';
import { ParodosPage } from '../ParodosPage';

export const Training = () => {
  return (
    <ParodosPage>
      <ContentHeader title="Training">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Performance-based training recommendations
      </Typography>
      <Tabs
        tabs={[
          {
            label: `RECENT`,
            content: <TrainingCard training={mockRecentTraining} />,
          },
          {
            label: `HISTORY`,
            content: <TrainingHistory />,
          },
        ]}
      />
    </ParodosPage>
  );
};
