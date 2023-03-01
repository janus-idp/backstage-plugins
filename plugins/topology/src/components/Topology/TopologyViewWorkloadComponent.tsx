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
import { K8sResourcesClustersContext } from '../../hooks/K8sResourcesContext';

type TopologyViewWorkloadComponentProps = {
  useToolbar: boolean;
  onClusterChange: React.Dispatch<React.SetStateAction<number>>;
};

const TopologyViewWorkloadComponent: React.FC<
  TopologyViewWorkloadComponentProps
> = ({ useToolbar = false, onClusterChange }) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const controller = useVisualizationController();
  const layout = 'ColaNoForce';
  const { loaded, dataModel } = useWorkloadsWatcher();
  const k8sClusters = React.useContext(K8sResourcesClustersContext);

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

  return k8sClusters.length < 1 ? (
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
        useToolbar && <TopologyToolbar setClusterContext={onClusterChange} />
      }
    >
      {loaded && dataModel?.nodes?.length === 0 ? (
        <TopologyEmptyState />
      ) : (
        <VisualizationSurface state={{ selectedIds }} />
      )}
    </TopologyView>
  );
};

export default TopologyViewWorkloadComponent;
