import {
  ColaLayout,
  Graph,
  Layout,
  LayoutFactory,
} from '@patternfly/react-topology';

import { KialiDagreLayout } from '../layouts/KialiDagreLayout';

export const KialiLayoutFactory: LayoutFactory = (
  type: string,
  graph: Graph,
): Layout => {
  switch (type) {
    case 'Dagre':
      return new KialiDagreLayout(graph, {
        linkDistance: 40,
        nodeDistance: 25,
        marginx: undefined,
        marginy: undefined,
        ranker: 'network-simplex',
        rankdir: 'LR',
      });
    default:
      return new ColaLayout(graph, { layoutOnDrag: false });
  }
};
