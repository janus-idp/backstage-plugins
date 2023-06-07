import {
  ColaLayout,
  Graph,
  Layout,
  LayoutFactory,
} from '@patternfly/react-topology';

const defaultLayoutFactory: LayoutFactory = (
  _type: string,
  graph: Graph,
): Layout | undefined => new ColaLayout(graph, { layoutOnDrag: false });

export default defaultLayoutFactory;
