import React from 'react';

import { Content, Page, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { kialiApiRef } from '../../api';

export const KialiNoPath = () => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);

  return (
    <Page themeId="tool">
      <Content>
        <WarningPanel
          severity="error"
          title={`Could not find path /kiali${window.location.pathname
            .split('/kiali')
            .pop()} in Kiali Plugin.`}
        >
          Path {window.location.pathname} not exist in Kiali Plugin
        </WarningPanel>
      </Content>
    </Page>
  );
};
