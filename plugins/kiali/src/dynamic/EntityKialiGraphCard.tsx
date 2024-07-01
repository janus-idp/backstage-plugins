import * as React from 'react';

import { CodeSnippet, EmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box } from '@material-ui/core';

import { TrafficGraphCard } from '../pages/TrafficGraph/TrafficGraphCard';

export const EntityKialiGraphCard = () => {
  const { entity } = useEntity();

  return !entity ? (
    <EmptyState
      missing="data"
      title="No resources to show with these annotations"
      description={
        <>
          Kiali detected the annotations
          <div style={{ marginTop: '40px' }}>
            This is the entity loaded.
            <Box style={{ marginTop: '10px' }}>
              <CodeSnippet
                text={JSON.stringify(entity, null, 2)}
                language="yaml"
                showLineNumbers
                customStyle={{ background: 'inherit', fontSize: '115%' }}
              />
            </Box>
          </div>
        </>
      }
    />
  ) : (
    <TrafficGraphCard />
  );
};
