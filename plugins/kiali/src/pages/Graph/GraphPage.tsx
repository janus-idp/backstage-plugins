import * as React from 'react';
import { useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import FlexView from 'react-flexview';
import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import * as FilterHelper from '../../components/FilterList/FilterHelper';
import {ErrorBoundary} from '../../components/ErrorBoundary/ErrorBoundary';

/*CytosscapeGraph */
import { EmptyGraphLayout } from '../../components/CytoscapeGraph/EmptyGraphLayout';
import { CytoscapeGraph } from '../../components/CytoscapeGraph/CytoscapeGraph';
import { EdgeContextMenu } from '../../components/CytoscapeGraph/ContextMenu/EdgeContextMenu';
import { NodeContextMenu } from '../../components/CytoscapeGraph/ContextMenu/NodeContextMenu';

import { isMultiCluster } from '../../config';
import {  kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { WorkloadListItem } from '../../types/Workload';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';
import { style } from 'typestyle';
import { PFColors } from '../../components/Pf/PfColors';
import { getFocusSelector, unsetFocusSelector } from '../../utils/SearchParamUtils';
import { DecoratedGraphElements } from '../../types/Graph';
import { FetchParams, GraphDataSource } from '../../services/GraphDataSource';
import { PeerAuthentication } from '../../types/IstioObjects';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';

const containerStyle = style({
  minHeight: '350px',
  // TODO: try flexbox to remove this calc
  height: 'calc(100vh - 113px)' // View height minus top bar height minus secondary masthead
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
  const kialiClient = useApi(kialiApiRef);
  const errorBoundaryRef = React.createRef();
  let focusSelector: string | undefined = getFocusSelector();
  let graphDataSource: GraphDataSource = new GraphDataSource();

  const [graphData, setGraphData] = React.useState<GraphData>({
    elements: { edges: [], nodes: [] },
    elementsChanged: false,
    fetchParams: graphDataSource.fetchParameters,
    isLoading: true,
    timestamp: 0
  });
  const [wizardsData, setWizardsData] = React.useState<WizardsData>({
    showWizard: false,
    wizardType: '',
    updateMode: false,
    gateways: [],
    k8sGateways: [],
    peerAuthentications: [],
    namespace: ''
  });
  const [showConfirmDeleteTrafficRouting, setShowConfirmDeleteTrafficRouting] = React.useState<boolean>(false);

  
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  
  const load = async () => {
    kialiClient.getNamespaces().then(namespacesResponse => {
      const allNamespaces: NamespaceInfo[] = getNamespaces(
        namespacesResponse,
        namespaces,
      );
      const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
      setNamespaces(nsl);
    });
  };

  const notifyError = (error: Error, _componentStack: string) => {
    kialiState.alertUtils!.add(`There was an error when rendering the graph: ${error.message}, please try a different layout`);
  };

  const cleanup = () => {
    if (!!focusSelector) {
      focusSelector = undefined;
      unsetFocusSelector();
    }
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

  React.useEffect(() => {
  
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return () => cleanup();
  }, [activeNs, duration]);

  if (loading) {
    return <CircularProgress />;
  }


  return (
    <Page themeId="tool">
      <Content>
        <FlexView className={containerStyle} column={true}>
          GraphToolbar
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
                  onEmptyGraphAction={this.handleEmptyGraphAction}
                  onDeleteTrafficRouting={this.handleDeleteTrafficRouting}
                  onLaunchWizard={this.handleLaunchWizard}
                  onNodeDoubleTap={this.handleDoubleTap}
                  ref={refInstance => this.setCytoscapeGraph(refInstance)}
                  {...this.props}
                />
            </ErrorBoundary>
          </FlexView>
        </FlexView>
      </Content>
    </Page>
  );
};
