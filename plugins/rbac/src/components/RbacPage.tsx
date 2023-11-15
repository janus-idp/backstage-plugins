import React from 'react';

import { Content, Header, InfoCard, Page } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { Grid, Typography } from '@material-ui/core';

import { policyEntityReadPermission } from '@janus-idp/backstage-plugin-rbac-common';

export const RbacPage = () => (
  <RequirePermission
    permission={policyEntityReadPermission}
    resourceRef={policyEntityReadPermission.resourceType}
  >
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
  </RequirePermission>
);
