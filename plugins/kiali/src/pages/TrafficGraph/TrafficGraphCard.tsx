import * as React from 'react';

import '@backstage/core-components';

import { useEntity } from '@backstage/plugin-catalog-react';

import { Card, CardHeader } from '@material-ui/core';

import { ENTITY } from '../../types/types';
import TrafficGraphPage from './TrafficGraphPage';

export const TrafficGraphCard = () => {
  const { entity } = useEntity();

  return (
    <Card style={{ marginBottom: 20, height: 500 }}>
      <CardHeader title="Traffic Graph" />
      <TrafficGraphPage view={ENTITY} entity={entity} />
    </Card>
  );
};
