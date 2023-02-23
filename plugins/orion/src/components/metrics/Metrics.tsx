import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { ParodosPage } from '../ParodosPage';

export const Metrics = () => {
  return (
    <ParodosPage>
      <ContentHeader title="Metrics">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>Get insight of application metrics</Typography>
    </ParodosPage>
  );
};
