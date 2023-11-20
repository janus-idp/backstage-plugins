import React from 'react';
import { useParams } from 'react-router-dom';

import { Header, Page, TabbedLayout } from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { AboutCard } from './AboutCard';
import { MembersCard } from './MembersCard';
import { PermissionsCard } from './PermissionsCard';

export const RoleOverviewPage = () => {
  const { roleName, roleKind } = useParams();

  return (
    <Page themeId="tool">
      <Header title={`${roleKind}/${roleName}`} type="RBAC" typeLink="/rbac" />
      <TabbedLayout>
        <TabbedLayout.Route path="" title="Overview">
          <Grid container direction="row">
            <Grid item lg={12} xs={12}>
              <AboutCard />
            </Grid>
            <Grid item lg={6} xs={12}>
              <MembersCard roleName={`${roleKind}/${roleName}`} />
            </Grid>
            <Grid item lg={6} xs={12}>
              <PermissionsCard entityReference={`${roleKind}/${roleName}`} />
            </Grid>
          </Grid>
        </TabbedLayout.Route>
      </TabbedLayout>
    </Page>
  );
};
