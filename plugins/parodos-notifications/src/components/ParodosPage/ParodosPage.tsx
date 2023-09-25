import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
} from '@backstage/core-components';
import { ParodosNotificationsTable } from '../ParodosNotificationsTable';

export const ParodosPage = () => (
  <Page themeId="tool">
    <Header title="Parodos" subtitle="TODO: Optional subtitle to be written"/>
    <Content>
      <ContentHeader title="Notifications" />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <ParodosNotificationsTable />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
