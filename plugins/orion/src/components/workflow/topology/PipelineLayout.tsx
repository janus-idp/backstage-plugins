import React from 'react';
import {
  DEFAULT_EDGE_TYPE,
  DEFAULT_FINALLY_NODE_TYPE,
  DEFAULT_SPACER_NODE_TYPE,
  getEdgesFromNodes,
  getSpacerNodes,
  Graph,
  GRAPH_LAYOUT_END_EVENT,
  Layout,
  PipelineDagreLayout,
  SELECTION_EVENT,
  SelectionEventListener,
  TopologyView,
  useEventListener,
  useVisualizationController,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import pipelineComponentFactory from './pipelineComponentFactory';
import { useDemoPipelineNodes } from './useDemoPipelineNodes';
import { GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL } from './DemoTaskGroupEdge';

export const PIPELINE_NODE_SEPARATION_VERTICAL = 10;

export const LAYOUT_TITLE = 'Layout';

const PIPELINE_LAYOUT = 'PipelineLayout';
const GROUPED_PIPELINE_LAYOUT = 'GroupedPipelineLayout';

const TopologyPipelineLayout: React.FC = () => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>();

  const controller = useVisualizationController();
  const pipelineNodes = useDemoPipelineNodes(false, false, false, false);

  React.useEffect(() => {
    const spacerNodes = getSpacerNodes(pipelineNodes);
    const nodes = [...pipelineNodes, ...spacerNodes];
    const edgeType = DEFAULT_EDGE_TYPE;
    const edges = getEdgesFromNodes(
      nodes.filter(n => !n.group),
      DEFAULT_SPACER_NODE_TYPE,
      edgeType,
      edgeType,
      [DEFAULT_FINALLY_NODE_TYPE],
      edgeType,
    );

    controller.fromModel(
      {
        graph: {
          id: 'g1',
          type: 'graph',
          x: 25,
          y: 25,
          layout: PIPELINE_LAYOUT,
        },
        nodes,
        edges,
      },
      true,
    );
    controller.getGraph().layout();
  }, [controller, pipelineNodes]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, ids => {
    setSelectedIds(ids);
  });

  return (
    <TopologyView>
      <VisualizationSurface state={{ selectedIds }} />
    </TopologyView>
  );
};

TopologyPipelineLayout.displayName = 'TopologyPipelineLayout';

export const PipelineLayout = React.memo(() => {
  const controller = new Visualization();
  controller.setFitToScreenOnLayout(true);
  controller.registerComponentFactory(pipelineComponentFactory);
  controller.registerLayoutFactory(
    (type: string, graph: Graph): Layout | undefined =>
      new PipelineDagreLayout(graph, {
        nodesep: PIPELINE_NODE_SEPARATION_VERTICAL,
        ranksep:
          type === GROUPED_PIPELINE_LAYOUT
            ? GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL
            : GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL,
        ignoreGroups: true,
        nodeDistance: -20,
      }),
  );
  controller.fromModel(
    {
      graph: {
        id: 'g1',
        type: 'graph',
        x: 25,
        y: 25,
        layout: PIPELINE_LAYOUT,
      },
    },
    false,
  );
  controller.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
    controller.getGraph().fit(5);
  });

  return (
    <VisualizationProvider controller={controller}>
      <TopologyPipelineLayout />
    </VisualizationProvider>
  );
});
