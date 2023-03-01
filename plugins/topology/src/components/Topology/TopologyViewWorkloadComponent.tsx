import * as React from 'react';
import {
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
  const { clusters, selectedClusterErrors, setSelectedCluster, responseError } =
    React.useContext(K8sResourcesContext);

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

  useEventListener<SelectionEventListener>(SELECTION_EVENT, ids => {
    setSelectedIds(ids);
  });

  if (!loaded) return <Progress />;

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
          viewToolbar={
            useToolbar && (
              <TopologyToolbar setClusterContext={setSelectedCluster} />
            )
          }
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
