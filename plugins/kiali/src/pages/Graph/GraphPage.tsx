import * as React from 'react';
import { useRef } from 'react';
import * as Cy from 'cytoscape';
import { useAsyncFn, useDebounce } from 'react-use';
import FlexView from 'react-flexview';
import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import * as FilterHelper from '../../components/FilterList/FilterHelper';
import {ErrorBoundary} from '../../components/ErrorBoundary/ErrorBoundary';
import * as CytoscapeGraphUtils from '../../components/CytoscapeGraph/CytoscapeGraphUtils';
/*CytosscapeGraph */
import { EmptyGraphLayout } from '../../components/CytoscapeGraph/EmptyGraphLayout';
import { CytoscapeGraph, GraphNodeDoubleTapEvent } from '../../components/CytoscapeGraph/CytoscapeGraph';
import { EdgeContextMenu } from '../../components/CytoscapeGraph/ContextMenu/EdgeContextMenu';
import { NodeContextMenu } from '../../components/CytoscapeGraph/ContextMenu/NodeContextMenu';
import { GraphUrlParams, makeNodeGraphUrlFromParams } from '../../components/Nav/NavUtils';
import { isMultiCluster } from '../../config';
import {  kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { WorkloadListItem } from '../../types/Workload';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';
import { style } from 'typestyle';
import { PFColors } from '../../components/Pf/PfColors';
import { getClusterName, getFocusSelector, unsetFocusSelector } from '../../utils/SearchParamUtils';
import { BoxByType, DecoratedGraphElements, NodeParamsType, NodeType, UNKNOWN } from '../../types/Graph';
import { EMPTY_GRAPH_DATA, FetchParams, GraphDataSource } from '../../services/GraphDataSource';
import { PeerAuthentication } from '../../types/IstioObjects';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { MessageType } from '../../types/MessageCenter';
import { NamespaceActions } from '../../actions';
import { GraphActions } from '../../actions/GraphActions';
import { TourActions } from '../../actions/TourActions';
import { GraphToolbar } from './GraphToolbar/GraphToolbar';
import { GraphToolbarActions } from '../../actions/GraphToolbarActions';
import { getNextTourStop } from '../../components/Tour/TourStop';
import { GraphTour } from './GraphHelpTour';

const containerStyle = style({
  minHeight: '350px',
  // TODO: try flexbox to remove this calc
  height: 'calc(80vh - 113px)' // View height minus top bar height minus secondary masthead
});

const cytoscapeGraphWrapperDivStyle = style({
  position: 'relative',
  backgroundColor: PFColors.BackgroundColor200
});

const cytoscapeGraphContainerStyle = style({ flex: '1', minWidth: '350px', zIndex: 0, paddingRight: '5px' });

const GraphErrorBoundaryFallback = () => {
  return (
    <div className={cytoscapeGraphContainerStyle}>
      <EmptyGraphLayout
        isError={true}
        isMiniGraph={false}
        namespaces={[]}
        showIdleNodes={false}
        toggleIdleNodes={() => undefined}
      />
    </div>
  );
};

// GraphURLPathProps holds path variable values.  Currently all path variables are relevant only to a node graph
export type GraphURLPathProps = {
  aggregate: string;
  aggregateValue: string;
  app: string;
  namespace: string;
  service: string;
  version: string;
  workload: string;
};

type WizardsData = {
  // Wizard configuration
  showWizard: boolean;
  wizardType: string;
  updateMode: boolean;

  // Data (payload) sent to the wizard or the confirm delete dialog
  gateways: string[];
  k8sGateways: string[];
  peerAuthentications: PeerAuthentication[];
  namespace: string;
  serviceDetails?: ServiceDetailsInfo;
};

export type GraphData = {
  elements: DecoratedGraphElements;
  elementsChanged: boolean; // true if current elements differ from previous fetch, can be used as an optimization.
  errorMessage?: string;
  fetchParams: FetchParams;
  isLoading: boolean;
  isError?: boolean;
  timestamp: number;
};


export const GraphPage = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const errorBoundaryRef: React.RefObject<unknown> = React.createRef();
  const cytoscapeGraphRef = React.useRef<Cy.Core>();
  let graphDataSource: GraphDataSource = new GraphDataSource();

  const [focusSelector, setFocusSelector] = React.useState<string | undefined>(getFocusSelector());  
  const [graphData, setGraphData] = React.useState<GraphData>({
    elements: { edges: [], nodes: [] },
    elementsChanged: false,
    fetchParams: graphDataSource.fetchParameters,
    isLoading: true,
    timestamp: 0
  });
  const [isEmpty, setIsEmpty] = React.useState<boolean>(false);
  const [isReady, setIsReady] = React.useState<boolean>(false); 
  

  const getNodeParamsFromProps = (props: Partial<GraphURLPathProps>): NodeParamsType | undefined => {
    const aggregate = props.aggregate;
    const aggregateOk = aggregate && aggregate !== UNKNOWN;
    const aggregateValue = props.aggregateValue;
    const aggregateValueOk = aggregateValue && aggregateValue !== UNKNOWN;
    const app = props.app;
    const appOk = app && app !== UNKNOWN;
    const namespace = props.namespace;
    const namespaceOk = namespace && namespace !== UNKNOWN;
    const service = props.service;
    const serviceOk = service && service !== UNKNOWN;
    const workload = props.workload;
    const workloadOk = workload && workload !== UNKNOWN;
    if (!aggregateOk && !aggregateValueOk && !appOk && !serviceOk && !workloadOk) {
      // @ts-ignore
      return;
    }

    let nodeType: NodeType;
    let version: string | undefined;
    if (aggregateOk) {
      nodeType = NodeType.AGGREGATE;
      version = '';
    } else if (appOk || workloadOk) {
      nodeType = appOk ? NodeType.APP : NodeType.WORKLOAD;
      version = props.version;
    } else {
      nodeType = NodeType.SERVICE;
      version = '';
    }
    return {
      aggregate: aggregate!,
      aggregateValue: aggregateValue!,
      app: app!,
      cluster: getClusterName(),
      namespace: { name: namespace! },
      nodeType: nodeType,
      service: service!,
      version: version,
      workload: workload!
    };
  }

  

  
  
  const notifyError = (error: Error, _componentStack: string) => {
    kialiState.alertUtils!.add(`There was an error when rendering the graph: ${error.message}, please try a different layout`);
  };

  const setCytoscapeGraph = (cytoscapeGraph: any) => {
    cytoscapeGraphRef.current = cytoscapeGraph;
  }

  const isNodeChanged = (prevNode?: NodeParamsType, node?: NodeParamsType): boolean => {
    if (prevNode === node) {
      return false;
    }
    if ((prevNode && !node) || (!prevNode && node)) {
      return true;
    }
    if (prevNode && node) {
      const nodeAggregateHasChanged = 
        prevNode.aggregate !== node.aggregate || prevNode.aggregateValue !== node.aggregateValue;
      const nodeAppHasChanged = prevNode.app !== node.app;
      const nodeServiceHasChanged = prevNode.service !== node.service;
      const nodeVersionHasChanged = prevNode.version !== node.version;
      const nodeTypeHasChanged = prevNode.nodeType !== node.nodeType;
      const nodeWorkloadHasChanged = prevNode.workload !== node.workload;
      return (
        nodeAggregateHasChanged ||
        nodeAppHasChanged ||
        nodeServiceHasChanged ||
        nodeVersionHasChanged ||
        nodeWorkloadHasChanged ||
        nodeTypeHasChanged
      );
    }
    return false;
  }

  const handleDoubleTapSameNode = (targetNode: NodeParamsType) => {
    const makeAppDetailsPageUrl = (namespace: string, nodeType: string, name?: string): string => {
      return `/namespaces/${namespace}/${nodeType}/${name}`;
    };
    const nodeType = targetNode.nodeType;
    let urlNodeType = targetNode.nodeType + 's';
    let name = targetNode.app;
    if (nodeType === 'service') {
      name = targetNode.service;
    } else if (nodeType === 'workload') {
      name = targetNode.workload;
    } else {
      urlNodeType = 'applications';
    }
    let detailsPageUrl = makeAppDetailsPageUrl(targetNode.namespace.name, urlNodeType, name);
    if (targetNode.cluster && isMultiCluster) {
      detailsPageUrl = detailsPageUrl + '?clusterName=' + targetNode.cluster;
    }    
    history.push(detailsPageUrl);    
    return;
  };

  const handleDoubleTap = (event: GraphNodeDoubleTapEvent) => {
    if (
      event.isInaccessible ||
      event.isServiceEntry ||
      (event.nodeType === NodeType.BOX && event.isBox !== BoxByType.APP)
    ) {
      return;
    }

    if (event.isOutOfMesh) {
      kialiState.alertUtils!.add(
        `A node with a missing sidecar provides no node-specific telemetry and can not provide a node detail graph.`,
        undefined,
        MessageType.WARNING
      );
      return;
    }
    if (event.isIdle) {
      kialiState.alertUtils!.add(
        `An idle node has no node-specific traffic and can not provide a node detail graph.`,
        undefined,
        MessageType.WARNING
      );
      return;
    }
    if (event.isOutside) {
      kialiState.dispatch.namespaceDispatch(NamespaceActions.setActiveNamespaces([{ name: event.namespace }]))
      return;
    }

    // If graph is in the drilled-down view, there is the chance that the user
    // double clicked the same node as in the full graph. Determine if this is
    // the case.
    let sameNode = false;
    const node = graphData.fetchParams.node;
    if (node) {
      sameNode = node && node.nodeType === event.nodeType;
      switch (event.nodeType) {
        case NodeType.AGGREGATE:
          sameNode = sameNode && node.aggregate === event.aggregate;
          sameNode = sameNode && node.aggregateValue === event.aggregateValue;
          break;
        case NodeType.APP:
          sameNode = sameNode && node.app === event.app;
          sameNode = sameNode && node.version === event.version;
          break;
        case NodeType.BOX:
          // we only support node graphs on app boxes, so assume app box
          sameNode = sameNode && node.app === event.app;
          break;
        case NodeType.SERVICE:
          sameNode = sameNode && node.service === event.service;
          break;
        case NodeType.WORKLOAD:
          sameNode = sameNode && node.workload === event.workload;
          break;
        default:
          sameNode = true; // don't navigate to unsupported node type
      }
    }

    const targetNode: NodeParamsType = { ...event, namespace: { name: event.namespace } };

    // If, while in the drilled-down graph, the user double clicked the same
    // node as in the main graph, it doesn't make sense to re-load the same view.
    // Instead, assume that the user wants more details for the node and do a
    // redirect to the details page.
    if (sameNode) {
      handleDoubleTapSameNode(targetNode);
      return;
    }

    // In case user didn't double-tap the same node, or if graph is in
    // full graph mode, redirect to the drilled-down graph of the chosen node.
    const urlParams: GraphUrlParams = {
      activeNamespaces: graphData.fetchParams.namespaces,
      duration: graphData.fetchParams.duration,
      edgeLabels: graphData.fetchParams.edgeLabels,
      edgeMode: kialiState.graph.edgeMode,
      graphLayout: kialiState.graph.layout,
      graphType: graphData.fetchParams.graphType,
      namespaceLayout: kialiState.graph.namespaceLayout,
      node: targetNode,
      refreshInterval: kialiState.userSettings.refreshInterval,
      showIdleEdges: kialiState.graph.toolbarState.showIdleEdges,
      showIdleNodes: kialiState.graph.toolbarState.showIdleNodes,
      showOperationNodes: kialiState.graph.toolbarState.showOperationNodes,
      showServiceNodes: kialiState.graph.toolbarState.showServiceNodes,
      trafficRates: graphData.fetchParams.trafficRates
    };

    // To ensure updated components get the updated URL, update the URL first and then the state
    history.push(makeNodeGraphUrlFromParams(urlParams));
  };

  const loadGraphDataFromBackend = () => {
    const queryTime: number | undefined = !!kialiState.userSettings.replayQueryTime
      ? kialiState.userSettings.replayQueryTime
      : undefined;

    graphDataSource.fetchGraphData({
      boxByCluster: kialiState.graph.toolbarState.boxByCluster,
      boxByNamespace: kialiState.graph.toolbarState.boxByNamespace,
      duration: kialiState.userSettings.duration,
      edgeLabels: kialiState.graph.toolbarState.edgeLabels,
      graphType: kialiState.graph.toolbarState.graphType,
      includeHealth: true,
      includeLabels: kialiState.graph.toolbarState.findValue.includes('label:') || kialiState.graph.toolbarState.hideValue.includes('label:'),
      injectServiceNodes: kialiState.graph.toolbarState.showServiceNodes,
      namespaces: kialiState.graph.node ? [kialiState.graph.node.namespace] : kialiState.namespaces.activeNamespaces,
      node: kialiState.graph.node,
      queryTime: queryTime,
      showIdleEdges: kialiState.graph.toolbarState.showIdleEdges,
      showIdleNodes: kialiState.graph.toolbarState.showIdleNodes,
      showOperationNodes: kialiState.graph.toolbarState.showOperationNodes,
      showSecurity: kialiState.graph.toolbarState.showSecurity,
      trafficRates: kialiState.graph.toolbarState.trafficRates
    });
  };

  const handleEmptyGraphAction = () => {
    loadGraphDataFromBackend();
  };

  const cleanup = () => {
    if (!!focusSelector) {
      setFocusSelector(undefined)
      unsetFocusSelector();
    }
    graphDataSource.removeListener('loadStart', handleGraphDataSourceStart);
    graphDataSource.removeListener('fetchError', handleGraphDataSourceError);
    graphDataSource.removeListener('fetchSuccess', handleGraphDataSourceSuccess);
    graphDataSource.removeListener('emptyNamespaces', handleGraphDataSourceEmpty);
  }
  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await load();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  const load = () => {
    graphDataSource.on('loadStart', handleGraphDataSourceStart);
    graphDataSource.on('fetchError', handleGraphDataSourceError);
    graphDataSource.on('fetchSuccess', handleGraphDataSourceSuccess);
    graphDataSource.on('emptyNamespaces', handleGraphDataSourceEmpty);
     // Let URL override current redux state at mount time.  We usually do this in
    // the constructor but it seems to work better here when the initial URL
    // is for a node graph.  When setting the node here it is available for the
    // loadGraphFromBackend() call.
    /*const urlNode = getNodeParamsFromProps(this.props);
    if (isNodeChanged(urlNode, kialiState.graph.node)) {
      // add the node namespace if necessary, but don't lose previously selected namespaces
      if (urlNode && !kialiState.namespaces.activeNamespaces.map(ns => ns.name).includes(urlNode.namespace.name)) {
        kialiState.dispatch.namespaceDispatch(NamespaceActions.setActiveNamespaces([urlNode.namespace, ...kialiState.namespaces.activeNamespaces]))
      }
      kialiState.dispatch.graphDispatch(GraphActions.setNode(urlNode))
    }

    /*const urlTrace = getTraceId();
    if (urlTrace !== this.props.trace?.traceID) {
      this.props.setTraceId(urlTrace);
    }*/
    // Ensure we initialize the graph. We wait for the first update so that
    // the toolbar can render and ensure all redux props are updated with URL
    // settings. That in turn ensures the initial fetchParams are correct.
    const isInitialLoad = !graphData.timestamp;
    
    loadGraphDataFromBackend();
  }
  /* Handle Graph */
  const handleGraphDataSourceStart = (isPreviousDataInvalid: boolean, fetchParams: FetchParams) => {
    setGraphData({
      elements: isPreviousDataInvalid ? EMPTY_GRAPH_DATA : graphData.elements,
      elementsChanged: false,
      fetchParams: fetchParams,
      isLoading: true,
      timestamp: isPreviousDataInvalid ? Date.now() : graphData.timestamp
    })
  };

  const handleGraphDataSourceError = (errorMessage: string | null, fetchParams: FetchParams) => {
    const prevElements = graphData.elements;
    setGraphData({
      elements: EMPTY_GRAPH_DATA,
      elementsChanged: CytoscapeGraphUtils.elementsChanged(prevElements, EMPTY_GRAPH_DATA),
      errorMessage: !!errorMessage ? errorMessage : undefined,
      isError: true,
      isLoading: false,
      fetchParams: fetchParams,
      timestamp: Date.now()
    })  
  };

  const handleGraphDataSourceSuccess = (
    graphTimestamp: number,
    _,
    elements: DecoratedGraphElements,
    fetchParams: FetchParams
  ) => {
    const prevElements = graphData.elements;
    setGraphData({
      elements: elements,
      elementsChanged: CytoscapeGraphUtils.elementsChanged(prevElements, elements),
      isLoading: false,
      fetchParams: fetchParams,
      timestamp: graphTimestamp * 1000
    }) 
    kialiState.dispatch.graphDispatch(GraphActions.setGraphDefinition(graphDataSource.graphDefinition))
  };

  const handleGraphDataSourceEmpty = (fetchParams: FetchParams) => {
    const prevElements = graphData.elements;
    setGraphData({
      elements: EMPTY_GRAPH_DATA,
      elementsChanged: CytoscapeGraphUtils.elementsChanged(prevElements, EMPTY_GRAPH_DATA),
      isLoading: false,
      fetchParams: fetchParams,
      timestamp: Date.now()
    }) 
  };

  const toggleHelp = () => {
    if (kialiState.graph.toolbarState.showLegend) {
      kialiState.dispatch.graphDispatch(GraphToolbarActions.toggleLegend)
    }
    if (kialiState.tourState.activeTour) {
      kialiState.dispatch.tourDispatch(TourActions.endTour)
    } else {
      const firstStop = getNextTourStop(GraphTour, -1, 'forward');
      kialiState.dispatch.tourDispatch(TourActions.startTour({ info: GraphTour, stop: firstStop || 0 }))
    }
  };

  /* Effects */


  /* Load graph when  */
  React.useEffect(() => {
      loadGraphDataFromBackend();
  }, [kialiState.namespaces.activeNamespaces, kialiState.graph.toolbarState, kialiState.userSettings.duration, kialiState.graph.node]);

  React.useEffect(() => {
    // Connect to graph data source updates
    load()
    return () => cleanup();
  }, []);

  React.useEffect(() => {
    // Ensure we initialize the graph when there is a change to activeNamespaces.
    kialiState.dispatch.graphDispatch(GraphActions.onNamespaceChange)
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.cleanError();    
    }
  }, [kialiState.namespaces.activeNamespaces]);

  React.useEffect(() =>{
    if (!!focusSelector) {
      setFocusSelector(undefined);
      unsetFocusSelector();
    }
  }, [focusSelector])

  React.useEffect(() =>{
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.cleanError();
    }
  }, [kialiState.graph.layout, kialiState.graph.namespaceLayout])

  React.useEffect(() =>{
    const empty = !(
      graphData.elements.nodes && Object.keys(graphData.elements.nodes).length > 0
    );
    const ready = !(empty || graphData.isError);
    setIsEmpty(empty)
    setIsReady(ready)
  }, [graphData])

  React.useEffect(() =>{
    if (kialiState.graph.toolbarState.showLegend && kialiState.tourState.activeTour) {
      kialiState.dispatch.tourDispatch(TourActions.endTour)
    }
  }, [kialiState.graph.toolbarState.showLegend, kialiState.tourState.activeTour])

  if (loading) {
    return <CircularProgress />;
  }

  const cy = cytoscapeGraphRef && cytoscapeGraphRef.current ? cytoscapeGraphRef.current.getCy() : null;
  

  
  return (
    <Page themeId="tool">
      <Content>
        <FlexView className={containerStyle} column={true}>
          <div>
            <GraphToolbar
              cy={cy}
              disabled={graphData.isLoading}
              elementsChanged={graphData.elementsChanged}
              onToggleHelp={toggleHelp}
            />
          </div>
          <FlexView
            grow={true}
            className={`${cytoscapeGraphWrapperDivStyle}`}
          >
            <ErrorBoundary
              ref={errorBoundaryRef}
              onError={notifyError}
              fallBackComponent={<GraphErrorBoundaryFallback />}
            >
              <CytoscapeGraph
                  containerClassName={cytoscapeGraphContainerStyle}
                  contextMenuEdgeComponent={EdgeContextMenu}
                  contextMenuNodeComponent={NodeContextMenu}
                  focusSelector={focusSelector}
                  graphData={graphData}
                  onEmptyGraphAction={handleEmptyGraphAction}
                  onNodeDoubleTap={handleDoubleTap}
                  ref={refInstance => setCytoscapeGraph(refInstance)}
                  compressOnHide={kialiState.graph.toolbarState.compressOnHide}
                  edgeLabels={kialiState.graph.toolbarState.edgeLabels}
                  edgeMode={kialiState.graph.edgeMode}
                  isMiniGraph={false}
                  layout={kialiState.graph.layout}
                  namespaceLayout={kialiState.graph.namespaceLayout}
                  rankBy={kialiState.graph.toolbarState.rankBy}
                  refreshInterval={kialiState.userSettings.refreshInterval}
                  showIdleEdges={kialiState.graph.toolbarState.showIdleEdges}
                  showIdleNodes={kialiState.graph.toolbarState.showIdleNodes}
                  showOutOfMesh={kialiState.graph.toolbarState.showOutOfMesh}
                  showOperationNodes={kialiState.graph.toolbarState.showOperationNodes}
                  showRank={kialiState.graph.toolbarState.showRank}
                  showSecurity={kialiState.graph.toolbarState.showSecurity}
                  showServiceNodes={kialiState.graph.toolbarState.showServiceNodes}
                  showTrafficAnimation={kialiState.graph.toolbarState.showTrafficAnimation}
                  showVirtualServices={kialiState.graph.toolbarState.showVirtualServices}
                  summaryData={kialiState.graph.summaryData}
                  toggleIdleNodes={() => kialiState.dispatch.graphDispatch(GraphToolbarActions.toggleIdleNodes)}
                  theme={kialiState.globalState.theme}
                  alertUtils={kialiState.alertUtils!}
                />
            </ErrorBoundary>
          </FlexView>
        </FlexView>
      </Content>
    </Page>
  );
};
