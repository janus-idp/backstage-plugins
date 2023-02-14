import {
  Graph,
  Layout,
  LayoutFactory,
  ColaLayout,
} from '@patternfly/react-topology';

const defaultLayoutFactory: LayoutFactory = (
  _type: string,
  graph: Graph,
): Layout | undefined => new ColaLayout(graph, { layoutOnDrag: false });

export default defaultLayoutFactory;
