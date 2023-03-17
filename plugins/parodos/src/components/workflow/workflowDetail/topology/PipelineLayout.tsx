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
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import pipelineComponentFactory from './pipelineComponentFactory';
import { useDemoPipelineNodes } from './useDemoPipelineNodes';
import { WorkFlowTask } from './type/WorkFlowTask';

export const PIPELINE_NODE_SEPARATION_VERTICAL = 10;

const PIPELINE_LAYOUT = 'PipelineLayout';

const controller = new Visualization();
type Props = {
  tasks: WorkFlowTask[];
  setSelectedTask: (selectedTask: string) => void;
};

const TopologyPipelineLayout = (props: Props) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>();
  const pipelineNodes = useDemoPipelineNodes(props.tasks);

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
          layout: PIPELINE_LAYOUT,
          // to disable scale, add: scaleExtent: [1, 0],
        },
        nodes,
        edges,
      },
      true,
    );
  }, [pipelineNodes, props.tasks]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, ids => {
    setSelectedIds(ids);
    props.setSelectedTask(ids.toString());
  });

  return (
    <TopologyView>
      <VisualizationSurface state={{ selectedIds }} />
    </TopologyView>
  );
};

TopologyPipelineLayout.displayName = 'TopologyPipelineLayout';

export const PipelineLayout = React.memo((props: Props) => {
  controller.setFitToScreenOnLayout(true);
  controller.registerComponentFactory(pipelineComponentFactory);
  controller.registerLayoutFactory(
    (_type: string, graph: Graph): Layout | undefined =>
      new PipelineDagreLayout(graph, {
        nodesep: PIPELINE_NODE_SEPARATION_VERTICAL,
        ignoreGroups: true,
      }),
  );

  controller.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
    controller.getGraph().fit(70);
  });

  return (
    <VisualizationProvider controller={controller}>
      <TopologyPipelineLayout {...props} />
    </VisualizationProvider>
  );
});
