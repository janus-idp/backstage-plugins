import React from 'react';
import {
  Content,
  ContentHeader,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { PageHeader } from '../PageHeader';
import { NotificationList } from './NotificationList';

export const Notification = () => {
  return (
    <Page themeId="tool">
      <PageHeader />
      <Content>
        <ContentHeader title="Notification">
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
        <br />
        <Grid container direction="row">
          <Grid item xs={12}>
            <NotificationList />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
