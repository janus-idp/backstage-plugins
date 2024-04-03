import * as React from 'react';

import '@backstage/core-components';

import { Card, CardHeader } from '@material-ui/core';

import { ENTITY } from '../../types/types';
import { IstioConfigListPage } from '../IstioConfigList/IstioConfigListPage';

export const IstioConfigCard = () => {
  return (
    <Card>
      <CardHeader title="Istio Config" />
      <IstioConfigListPage view={ENTITY} />
    </Card>
  );
};
