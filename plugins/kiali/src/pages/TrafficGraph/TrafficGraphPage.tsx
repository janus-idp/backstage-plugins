import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Entity } from '@backstage/catalog-model';
import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';
import {
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';

import { HistoryManager } from '../../app/History';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getEntityNs } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import { EdgeLabelMode, GraphType, TrafficRate } from '../../types/Graph';
import { ENTITY } from '../../types/types';
import { KialiComponentFactory } from './factories/KialiComponentFactory';
import { KialiLayoutFactory } from './factories/KialiLayoutFactory';
import { decorateGraphData } from './util/GraphDecorator';
import { generateDataModel } from './util/GraphGenerator';

function TrafficGraphPage(props: { view?: string; entity?: Entity }) {
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [duration, setDuration] = useState(FilterHelper.currentDuration());
  const [loadingData, setLoadingData] = useState(false);
  const visualizationRef = React.useRef<Visualization>();

  const activeNamespaces = props.entity
    ? getEntityNs(props.entity)
    : kialiState.namespaces.activeNamespaces.map(ns => ns.name);

  if (!visualizationRef.current) {
    visualizationRef.current = new Visualization();
    visualizationRef.current.registerLayoutFactory(KialiLayoutFactory);
    visualizationRef.current.registerComponentFactory(KialiComponentFactory);
    visualizationRef.current.setFitToScreenOnLayout(true);
  }

  const graphStyle = kialiStyle({
    height: '100%',
  });

  const controller = visualizationRef.current;

  const graphConfig = useMemo(
    () => ({
      id: 'g1',
      type: 'graph',
      layout: 'Dagre',
    }),
    [],
  );

  const graphQueryElements = useMemo(
    () => ({
      appenders: 'health,deadNode,istio,serviceEntry,meshCheck,workloadEntry',
      activeNamespaces: activeNamespaces.join(','),
      namespaces: activeNamespaces.join(','),
      graphType: GraphType.VERSIONED_APP,
      injectServiceNodes: true,
      boxByNamespace: true,
      boxByCluster: true,
      showOutOfMesh: false,
      showSecurity: false,
      showVirtualServices: false,
      edgeLabels: [
        EdgeLabelMode.TRAFFIC_RATE,
        EdgeLabelMode.TRAFFIC_DISTRIBUTION,
      ],
      trafficRates: [
        TrafficRate.HTTP_REQUEST,
        TrafficRate.GRPC_TOTAL,
        TrafficRate.TCP_TOTAL,
      ],
    }),
    [activeNamespaces],
  );

  useEffect(() => {
    const d = HistoryManager.getDuration();
    if (d !== undefined) {
      setDuration(60);
    } else {
      setDuration(FilterHelper.currentDuration());
    }
  }, []);

  const timeDuration = (
    <TimeDurationComponent
      key="DurationDropdown"
      id="graph-duration-dropdown"
      disabled={false}
      duration={duration.toString()}
      setDuration={setDuration}
      label="From:"
    />
  );

  const fetchGraph = useCallback(async () => {
    setLoadingData(true);
    if (activeNamespaces.length === 0) {
      controller.fromModel(
        {
          nodes: [],
          edges: [],
          graph: graphConfig,
        },
        false,
      );
      setLoadingData(false);
      return;
    }

    try {
      const data = await kialiClient.getGraphElements(graphQueryElements);
      const graphData = decorateGraphData(data.elements, data.duration);
      const g = generateDataModel(graphData, graphQueryElements);
      controller.fromModel(
        {
          nodes: g.nodes,
          edges: g.edges,
          graph: graphConfig,
        },
        false,
      );
    } catch (error: any) {
      kialiState.alertUtils?.add(
        `Could not fetch services: ${getErrorString(error)}`,
      );
    } finally {
      setLoadingData(false);
    }
  }, [
    activeNamespaces,
    kialiClient,
    kialiState,
    controller,
    graphConfig,
    graphQueryElements,
  ]);

  useEffect(() => {
    fetchGraph();
  }, [duration, activeNamespaces, fetchGraph]);

  if (loadingData) {
    return <CircularProgress />;
  }

  return (
    <Content className={graphStyle}>
      {props.view !== ENTITY && (
        <DefaultSecondaryMasthead
          elements={[timeDuration]}
          onRefresh={fetchGraph}
        />
      )}
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ duration }} />
      </VisualizationProvider>
    </Content>
  );
}

export default TrafficGraphPage;
