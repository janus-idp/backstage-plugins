import React from 'react';

import {
  Content,
  ContentHeader,
  // Header,
  Page,
} from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { ParodosNotificationsTable } from '../ParodosNotificationsTable';

export const ParodosPage = () => (
  <Page themeId="tool">
    {/* <Header title="Parodos" subtitle="TODO: Optional subtitle to be written"/> */}
    <Content>
      <ContentHeader title="Parodos" />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <ParodosNotificationsTable />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
