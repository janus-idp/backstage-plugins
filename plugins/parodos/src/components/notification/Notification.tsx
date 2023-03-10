import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { NotificationList } from './NotificationList';
import { ParodosPage } from '../ParodosPage';

export const Notification = () => {
  return (
    <ParodosPage>
      <ContentHeader title="Notification">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <br />
      <Grid container direction="row">
        <Grid item xs={12}>
          <NotificationList />
        </Grid>
      </Grid>
    </ParodosPage>
  );
};
