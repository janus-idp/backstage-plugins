import { Progress } from '@backstage/core-components';
import * as React from 'react';
import { useAllNamespaces } from '../../hooks/useAllNamespaces';
import { OcirImagesTable } from './OcirImagesTable';

export const OcirImagesView = () => {
  const { loading, namespacesData } = useAllNamespaces();

  if (loading) {
    return <Progress />;
  }

  return <OcirImagesTable namespaces={namespacesData} />;
};
