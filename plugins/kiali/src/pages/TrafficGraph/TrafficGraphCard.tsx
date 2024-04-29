import * as React from 'react';

import '@backstage/core-components';

import { useEntity } from '@backstage/plugin-catalog-react';

import { Card, CardHeader } from '@material-ui/core';

import { ENTITY } from '../../types/types';
import TrafficGraphPage from './TrafficGraphPage';

export const TrafficGraphCard = () => {
  const { entity } = useEntity();

  return (
    <Card style={{ marginRight: 20, marginBottom: 20, height: 425.59 }}>
      <CardHeader title="Traffic Graph" />
      <TrafficGraphPage view={ENTITY} entity={entity} />
    </Card>
  );
};
