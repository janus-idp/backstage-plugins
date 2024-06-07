import React from 'react';
import { useParams } from 'react-router-dom';

import { Header, Page, TabbedLayout } from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { useLocationToast } from '../../hooks/useLocationToast';
import { useMembers } from '../../hooks/useMembers';
import { SnackbarAlert } from '../SnackbarAlert';
import { useToast } from '../ToastContext';
import { AboutCard } from './AboutCard';
import { MembersCard } from './MembersCard';
import { PermissionsCard } from './PermissionsCard';

export const RoleOverviewPage = () => {
  const { roleName, roleNamespace, roleKind } = useParams();
  const { toastMessage, setToastMessage } = useToast();
  const membersInfo = useMembers(`${roleKind}:${roleNamespace}/${roleName}`);

  useLocationToast(setToastMessage);

  const onAlertClose = () => {
    setToastMessage('');
  };

  return (
    <>
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={onAlertClose} />
      <Page themeId="tool">
        <Header
          title={`${roleKind}:${roleNamespace}/${roleName}`}
          type="RBAC"
          typeLink=".."
        />
        <TabbedLayout>
          <TabbedLayout.Route path="" title="Overview">
            <Grid container direction="row">
              <Grid item lg={12} xs={12}>
                <AboutCard
                  roleName={`${roleKind}:${roleNamespace}/${roleName}`}
                />
              </Grid>
              <Grid item lg={6} xs={12}>
                <MembersCard
                  roleName={`${roleKind}:${roleNamespace}/${roleName}`}
                  membersInfo={membersInfo}
                />
              </Grid>
              <Grid item lg={6} xs={12}>
                <PermissionsCard
                  entityReference={`${roleKind}:${roleNamespace}/${roleName}`}
                  canReadUsersAndGroups={membersInfo.canReadUsersAndGroups}
                />
              </Grid>
            </Grid>
          </TabbedLayout.Route>
        </TabbedLayout>
      </Page>
    </>
  );
};
