import { TopologyQuadrant } from '@patternfly/react-topology/dist/esm/types';
import * as React from 'react';
import { getUrlDecorator } from '../components/Graph/decorators/UrlDecorator';
import { GraphData } from '../types/topology-types';

export const useGraphData = (): GraphData =>
  React.useMemo(() => {
    return {
      decorators: {
        [TopologyQuadrant.upperRight]: [
          {
            id: 'ingress-url',
            priority: 1,
            quadrant: TopologyQuadrant.upperRight,
            decorator: getUrlDecorator,
          },
        ],
      },
    };
  }, []);
