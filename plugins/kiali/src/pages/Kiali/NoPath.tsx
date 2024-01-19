import React from 'react';
import { useLocation } from 'react-router-dom';

import { Content, Link, Page, WarningPanel } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { rootRouteRef } from '../../routes';

export const KialiNoPath = () => {
  const location = useLocation().pathname;
  const link = useRouteRef(rootRouteRef);
  return (
    <Page themeId="tool">
      <Content>
        <WarningPanel
          severity="error"
          title={`Could not find path ${location}`}
        >
          Path {location} not exist in Kiali Plugin.{' '}
          <Link to={link()}>Go to Kiali Plugin</Link>
        </WarningPanel>
      </Content>
    </Page>
  );
};
