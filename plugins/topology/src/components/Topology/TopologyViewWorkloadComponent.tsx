import React from 'react';

import { InfoCard, Progress } from '@backstage/core-components';

import {
  BaseNode,
  SELECTION_EVENT,
  SelectionEventListener,
  TopologyView,
  useEventListener,
  useVisualizationController,
  VisualizationSurface,
} from '@patternfly/react-topology';

import { TYPE_WORKLOAD } from '../../const';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { useSideBar } from '../../hooks/useSideBar';
import { useWorkloadsWatcher } from '../../hooks/useWorkloadWatcher';
import { ClusterErrors } from '../../types/types';
import { TopologyControlBar } from './TopologyControlBar';
import { TopologyEmptyState } from './TopologyEmptyState';
import TopologyErrorPanel from './TopologyErrorPanel';
import TopologyToolbar from './TopologyToolbar';

import './TopologyToolbar.css';

type TopologyViewWorkloadComponentProps = {
  useToolbar?: boolean;
};

const TopologyViewWorkloadComponent = ({
  useToolbar = false,
}: TopologyViewWorkloadComponentProps) => {
  const controller = useVisualizationController();
  const layout = 'ColaNoForce';
  const { loaded, dataModel } = useWorkloadsWatcher();
  const { clusters, selectedClusterErrors, responseError } =
    React.useContext(K8sResourcesContext);
  const [
    sideBar,
    sideBarOpen,
    selectedId,
    setSideBarOpen,
    setSelectedNode,
    removeSelectedIdParam,
  ] = useSideBar();

  const allErrors: ClusterErrors = [
    ...(responseError ? [{ message: responseError }] : []),
    ...(selectedClusterErrors ?? []),
  ];

  React.useEffect(() => {
    if (loaded && dataModel) {
      const model = {
        graph: {
          id: 'g1',
          type: 'graph',
          layout,
        },
        ...dataModel,
      };
      controller.fromModel(model, true);
    }
  }, [layout, loaded, dataModel, controller]);

  React.useEffect(() => {
    if (dataModel) {
      const selectedNode: BaseNode | null = selectedId
        ? (controller.getElementById(selectedId) as BaseNode)
        : null;
      setSelectedNode(selectedNode);
      if (selectedNode && selectedNode.getType() === TYPE_WORKLOAD)
        setSideBarOpen(true);
      else {
        setSideBarOpen(false);
      }
    }
  }, [controller, dataModel, selectedId, setSelectedNode, setSideBarOpen]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, (ids: string[]) => {
    const id = ids[0] ? ids[0] : '';
    const selNode = controller.getElementById(id) as BaseNode;
    setSelectedNode(selNode);
    if (!id || selNode.getType() !== TYPE_WORKLOAD) {
      removeSelectedIdParam();
    }
  });

  if (!loaded)
    return (
      <div data-testid="topology-progress">
        <Progress />
      </div>
    );

  return (
    <>
      {allErrors && allErrors.length > 0 && (
        <TopologyErrorPanel allErrors={allErrors} />
      )}
      <InfoCard className="bs-topology-wrapper" divider={false}>
        {clusters.length < 1 ? (
          <TopologyEmptyState />
        ) : (
          <TopologyView
            controlBar={
              loaded &&
              dataModel?.nodes?.length > 0 && (
                <TopologyControlBar controller={controller} />
              )
            }
            viewToolbar={useToolbar && <TopologyToolbar />}
            sideBar={sideBar}
            sideBarResizable
            sideBarOpen={sideBarOpen}
            minSideBarSize="400px"
          >
            {loaded && dataModel?.nodes?.length === 0 ? (
              <TopologyEmptyState />
            ) : (
              <VisualizationSurface state={{ selectedIds: [selectedId] }} />
            )}
          </TopologyView>
        )}
      </InfoCard>
    </>
  );
};

export default TopologyViewWorkloadComponent;
