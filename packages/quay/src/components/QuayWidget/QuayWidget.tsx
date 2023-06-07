import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Card, CardHeader } from '@material-ui/core';

import { QUAY_ANNOTATION_REPOSITORY } from '../../hooks';
import { isQuayAvailable } from '../../plugin';
import { QuayRepository } from '../QuayRepository';

const Widget = () => {
  return (
    <Card>
      <CardHeader title="Docker Image" />
      <QuayRepository />
    </Card>
  );
};

export const QuayWidget = () => {
  const { entity } = useEntity();

  return !isQuayAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={QUAY_ANNOTATION_REPOSITORY} />
  ) : (
    <Widget />
  );
};

export const QuayWidgetEntity = ({ entity }: { entity: Entity }) => {
  return !isQuayAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={QUAY_ANNOTATION_REPOSITORY} />
  ) : (
    <Widget />
  );
};
