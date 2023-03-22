import React from 'react';
import { ParodosPage } from '../ParodosPage';
import { ContentHeader, SupportButton, Tabs } from '@backstage/core-components';
import { Typography } from '@material-ui/core';

export const Deploy = () => {
  return (
    <ParodosPage>
      <ContentHeader title="Deploy">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>Start deploying service</Typography>
      <Tabs
        tabs={[
          {
            label: `RECENT`,
            content: <div>recent</div>,
          },
          {
            label: `HISTORY`,
            content: <div>history</div>,
          },
        ]}
      />
    </ParodosPage>
  );
};
