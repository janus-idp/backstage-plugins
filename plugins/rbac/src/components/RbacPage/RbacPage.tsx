import React from 'react';

import { Content, Header, InfoCard, Page } from '@backstage/core-components';

import { Grid, Typography } from '@material-ui/core';

export const RbacPage = () => (
  <Page themeId="tool">
    <Header title="Administration" />
    <Content>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Information card">
            <Typography variant="body1">
              All content should be wrapped in a card like this.
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
