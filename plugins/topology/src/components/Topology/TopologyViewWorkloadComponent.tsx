import * as React from 'react';
import {
  BaseNode,
  SelectionEventListener,
  SELECTION_EVENT,
  TopologyView,
  useEventListener,
  useVisualizationController,
  VisualizationSurface,
} from '@patternfly/react-topology';
import { Progress } from '@backstage/core-components';
import { TopologyEmptyState } from './TopologyEmptyState';
import { useWorkloadsWatcher } from '../../hooks/useWorkloadWatcher';
import { TopologyControlBar } from './TopologyControlBar';
import TopologyToolbar from './TopologyToolbar';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import TopologyErrorPanel from './TopologyErrorPanel';
import { ClusterErrors } from '../../types/types';
import { useSideBar } from '../../hooks/useSideBar';
import { TYPE_WORKLOAD } from '../../const';

import './TopologyToolbar.css';

type TopologyViewWorkloadComponentProps = {
  useToolbar?: boolean;
};

const TopologyViewWorkloadComponent: React.FC<
  TopologyViewWorkloadComponentProps
> = ({ useToolbar = false }) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const controller = useVisualizationController();
  const layout = 'ColaNoForce';
  const { loaded, dataModel } = useWorkloadsWatcher();
  const { clusters, selectedClusterErrors, responseError } =
    React.useContext(K8sResourcesContext);
  const [sideBar, sideBarOpen, selectedId, setSideBarOpen, setSelectedNode] =
    useSideBar(selectedIds);

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
      controller.fromModel(model, false);
    }
  }, [layout, loaded, dataModel, controller]);

  React.useEffect(() => {
    if (loaded && dataModel) {
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
  }, [
    controller,
    dataModel,
    loaded,
    selectedId,
    setSelectedNode,
    setSideBarOpen,
  ]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, ids => {
    setSelectedIds(ids);
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
            <VisualizationSurface state={{ selectedIds }} />
          )}
        </TopologyView>
      )}
    </>
  );
};

export default TopologyViewWorkloadComponent;
