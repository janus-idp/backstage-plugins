import React from 'react';

import { Content, Page } from '@backstage/core-components';

import { OverviewPage } from '../Overview/OverviewPage';
import { KialiHeader } from './Header/Header';
import { KialiNoPath } from './NoPath';

const noPath = 'noPath';
const getPathPage = () => {
  const pathname = window.location.pathname.split('/').pop();
  if (pathname && pathname === 'kiali') {
    return 'overview';
  } else if (pathname) {
    return pathname;
  }
  return noPath;
};

export const KialiPage = () => {
  const [kialiTab, _] = React.useState<string>(getPathPage());

  const renderPath = () => {
    switch (kialiTab) {
      case 'overview':
        return <OverviewPage />;
      default:
        return <KialiNoPath />;
    }
  };

  return (
    <Page themeId="tool">
      <Content>
        <KialiHeader title={kialiTab} />
        {renderPath()}
      </Content>
    </Page>
  );
};
