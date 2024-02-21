import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { KialiAppState } from '../../../store/Store';
import { GraphToolbarActions } from '../../../actions/GraphToolbarActions';
import { GraphFind } from './GraphFind';
import { GraphSettings } from './GraphSettings';
import {
  GraphType,
  NodeParamsType,
  EdgeLabelMode,
  SummaryData,
  TrafficRate,
  RankMode,
  NodeAttr
} from '../../../types/Graph';
import { history, HistoryManager, URLParam } from '../../../app/History';
import { Namespace, namespacesFromString, namespacesToString } from '../../../types/Namespace';
import { NamespaceActions } from '../../../actions/NamespaceAction';
import { GraphActions } from '../../../actions/GraphActions';
import { GraphTourStops } from '../GraphHelpTour';
import { TourStop } from '../../../components/Tour/TourStop';
import { KialiIcon } from '../../../config/KialiIcon';
//import { Replay } from '../../../components/Time/Replay';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { GraphSecondaryMasthead } from './GraphSecondaryMasthead';
import { INITIAL_USER_SETTINGS_STATE } from 'reducers/UserSettingsState';
import { GraphReset } from './GraphReset';
import { GraphFindPF } from './GraphFindPF';
import { KialiContext } from '../../../store';
import { style } from 'typestyle';

type ReduxProps = {
  activeNamespaces: Namespace[];
  edgeLabels: EdgeLabelMode[];
  graphType: GraphType;
  node?: NodeParamsType;
  rankBy: RankMode[];
  replayActive: boolean;
  setActiveNamespaces: (activeNamespaces: Namespace[]) => void;
  setEdgeLabels: (edgeLabels: EdgeLabelMode[]) => void;
  setGraphType: (graphType: GraphType) => void;
  setIdleNodes: (idleNodes: boolean) => void;
  setNode: (node?: NodeParamsType) => void;
  setRankBy: (rankLabels: RankMode[]) => void;
  setTrafficRates: (rates: TrafficRate[]) => void;
  showIdleNodes: boolean;
  summaryData: SummaryData | null;
  toggleReplayActive: () => void;
  trafficRates: TrafficRate[];
};

type GraphToolbarProps = {
  controller?: any;
  cy?: any;
  disabled: boolean;
  elementsChanged: boolean;
  isPF?: boolean;
  onToggleHelp: () => void;
};

const helpStyle = style({
  marginRight: '0.5rem',
  alignSelf: 'center'
});

export const GraphToolbar = (props: GraphToolbarProps) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;


  const handleNamespaceReturn = (): void => {
    const route = 'graph';
    if (
      !kialiState.graph.summaryData ||
      (kialiState.graph.summaryData.summaryType !== 'node' && kialiState.graph.summaryData.summaryType !== 'box')
    ) {
      history.push(`/${route}/namespaces`);
      return;
    }

    const selector = `node[id = "${kialiState.graph.summaryData!.summaryTarget.data(NodeAttr.id)}"]`;
    kialiState.dispatch.graphDispatch(GraphActions.setNode(undefined))
    history.push(`/${route}/namespaces?focusSelector=${encodeURI(selector)}`);
  };
  /*
  constructor(props: GraphToolbarProps) {
    super(props);
    // Let URL override current redux state at construction time. Update URL as needed.
    const urlParams = new URLSearchParams(history.location.search);

    const urlEdgeLabels = HistoryManager.getParam(URLParam.GRAPH_EDGE_LABEL, urlParams);
    if (!!urlEdgeLabels) {
      if (urlEdgeLabels !== this.kialiState.graph.toolbarState.edgeLabels.join(',')) {
        props.setEdgeLabels(urlEdgeLabels.split(',') as EdgeLabelMode[]);
      }
    } else if (props.setEdgeLabels.length > 0) {
      HistoryManager.setParam(URLParam.GRAPH_EDGE_LABEL, this.kialiState.graph.toolbarState.edgeLabels.join(','));
    }

    const urlRankLabels = HistoryManager.getParam(URLParam.GRAPH_RANK_BY, urlParams);
    if (!!urlRankLabels) {
      if (urlRankLabels !== this.kialiState.graph.toolbarState.rankBy.join(',')) {
        props.setRankBy(urlRankLabels.split(',') as RankMode[]);
      }
    } else if (props.setRankBy.length > 0) {
      HistoryManager.setParam(URLParam.GRAPH_RANK_BY, this.kialiState.graph.toolbarState.rankBy.join(','));
    }

    const urlReplayActive = HistoryManager.getBooleanParam(URLParam.GRAPH_REPLAY_ACTIVE);
    if (urlReplayActive !== undefined) {
      if (urlReplayActive !== this.kialiState.userSettings.replayActive) {
        this.props.toggleReplayActive();
      }
    } else if (this.kialiState.userSettings.replayActive !== INITIAL_USER_SETTINGS_STATE.replayActive) {
      HistoryManager.setParam(URLParam.GRAPH_REPLAY_ACTIVE, String(this.kialiState.userSettings.replayActive));
    }

    const urlGraphTraffic = HistoryManager.getParam(URLParam.GRAPH_TRAFFIC, urlParams);
    if (!!urlGraphTraffic) {
      if (urlGraphTraffic !== this.kialiState.graph.toolbarState.join(',')) {
        props.setTrafficRates(urlGraphTraffic.split(',') as TrafficRate[]);
      }
    } else if (this.kialiState.graph.toolbarState.length > 0) {
      HistoryManager.setParam(URLParam.GRAPH_TRAFFIC, this.kialiState.graph.toolbarState.join(','));
    }

    const urlGraphType = HistoryManager.getParam(URLParam.GRAPH_TYPE, urlParams) as GraphType;
    if (!!urlGraphType) {
      if (urlGraphType !== this.kialiState.graph.toolbarState.graphType) {
        props.setGraphType(urlGraphType);
      }
    } else {
      HistoryManager.setParam(URLParam.GRAPH_TYPE, String(this.kialiState.graph.toolbarState.graphType));
    }

    const urlNamespaces = HistoryManager.getParam(URLParam.NAMESPACES, urlParams);
    if (!!urlNamespaces) {
      if (urlNamespaces !== namespacesToString(this.kialiState.namespaces.activeNamespaces)) {
        props.setActiveNamespaces(namespacesFromString(urlNamespaces));
      }
    } else if (this.kialiState.namespaces.activeNamespaces.length > 0) {
      HistoryManager.setParam(URLParam.NAMESPACES, namespacesToString(this.kialiState.namespaces.activeNamespaces));
    }
  }*/

/*
  componentDidUpdate(prevProps: GraphToolbarProps) {
    // ensure redux state and URL are aligned
    if (String(prevProps.edgeLabels) !== String(this.kialiState.graph.toolbarState.edgeLabels)) {
      if (this.kialiState.graph.toolbarState.edgeLabels?.length === 0) {
        HistoryManager.deleteParam(URLParam.GRAPH_EDGE_LABEL, true);
      } else {
        HistoryManager.setParam(URLParam.GRAPH_EDGE_LABEL, String(this.props.edgeLabels));
      }
    }

    if (String(prevProps.rankBy) !== String(this.props.rankBy)) {
      if (this.props.rankBy?.length === 0) {
        HistoryManager.deleteParam(URLParam.GRAPH_RANK_BY, true);
      } else {
        HistoryManager.setParam(URLParam.GRAPH_RANK_BY, String(this.props.rankBy));
      }
    }

    if (namespacesToString(prevProps.activeNamespaces) !== namespacesToString(this.props.activeNamespaces)) {
      if (this.props.activeNamespaces?.length === 0) {
        HistoryManager.deleteParam(URLParam.NAMESPACES, true);
      } else {
        HistoryManager.setParam(URLParam.NAMESPACES, namespacesToString(this.props.activeNamespaces));
      }
    }

    if (String(prevProps.replayActive) !== String(this.props.replayActive)) {
      if (this.props.replayActive === INITIAL_USER_SETTINGS_STATE.replayActive) {
        HistoryManager.deleteParam(URLParam.GRAPH_REPLAY_ACTIVE, true);
      } else {
        HistoryManager.setParam(URLParam.GRAPH_REPLAY_ACTIVE, String(this.props.replayActive));
      }
    }

    if (String(prevProps.trafficRates) !== String(this.props.trafficRates)) {
      if (this.props.trafficRates?.length === 0) {
        HistoryManager.deleteParam(URLParam.GRAPH_TRAFFIC, true);
      } else {
        HistoryManager.setParam(URLParam.GRAPH_TRAFFIC, String(this.props.trafficRates));
      }
    }

    if (prevProps.graphType !== this.props.graphType) {
      HistoryManager.setParam(URLParam.GRAPH_TYPE, String(this.props.graphType));
    }
  }

  componentWillUnmount() {
    // If replay was left active then turn it off
    if (this.props.replayActive) {
      this.props.toggleReplayActive();
    }
  }*/

  
 
  return (
    <>
      <GraphSecondaryMasthead
        disabled={props.disabled}
        graphType={kialiState.graph.toolbarState.graphType}
        isNodeGraph={!!kialiState.graph.node}
        onToggleHelp={props.onToggleHelp}
        onGraphTypeChange={() => kialiState.dispatch.graphDispatch(GraphToolbarActions.setGraphType)}
      />
      <Toolbar style={{ width: '100%' }}>
        <ToolbarGroup aria-label="graph settings" style={{ margin: 0, alignItems: 'flex-start' }}>
          {kialiState.graph.node && (
            <ToolbarItem style={{ margin: 0 }}>
              <Tooltip key={'graph-tour-help-ot'} position={TooltipPosition.right} content={'Back to full graph'}>
                <Button variant={ButtonVariant.link} onClick={handleNamespaceReturn}>
                  <KialiIcon.Back />
                </Button>
              </Tooltip>
            </ToolbarItem>
          )}

          <ToolbarItem style={{ margin: 0 }}>
            <TourStop info={GraphTourStops.Display}>
              <GraphSettings graphType={kialiState.graph.toolbarState.graphType} disabled={props.disabled} />
            </TourStop>
          </ToolbarItem>

          {props.isPF ? (
            <ToolbarItem>
              <GraphFindPF controller={props.controller} elementsChanged={props.elementsChanged} />
            </ToolbarItem>
          ) : (
            <ToolbarItem>
              <GraphFind cy={props.cy} elementsChanged={props.elementsChanged} />
            </ToolbarItem>
          )}

          <ToolbarItem style={{ marginLeft: 'auto', alignSelf: 'center' }}>
            <Tooltip key={'graph-tour-help-ot'} position={TooltipPosition.right} content="Shortcuts and tips...">
              <TourStop info={GraphTourStops.Shortcuts}>
                <Button
                  id="graph-tour"
                  variant={ButtonVariant.link}
                  className={helpStyle}
                  onClick={props.onToggleHelp}
                  isInline
                >
                  <KialiIcon.Help />
                  <span style={{ marginLeft: '5px' }}>Help</span>
                </Button>
              </TourStop>
            </Tooltip>
            <GraphReset />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
     
    </>
  );
  // {kialiState.userSettings.replayActive && <Replay id="time-range-replay" />}

  
}