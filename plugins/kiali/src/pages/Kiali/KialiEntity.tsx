import React from 'react';

import { Content } from '@backstage/core-components';

import { baseStyle } from '../../styles/StyleUtils';
import { ListViewPage } from '../Overview/ListView/ListViewPage';
import { OverviewPage } from '../Overview/OverviewPage';

export const KialiEntity = () => {
  return (
    <div className={baseStyle}>
      <Content>
        <OverviewPage entity />
        <ListViewPage />
      </Content>
    </div>
  );
};
