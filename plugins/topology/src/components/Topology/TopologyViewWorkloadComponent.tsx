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

const TopologyViewWorkloadComponent = () => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const controller = useVisualizationController();
  const layout = 'ColaNoForce';
  const { loaded, dataModel } = useWorkloadsWatcher();

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

  return loaded && dataModel?.nodes?.length === 0 ? (
    <TopologyEmptyState />
  ) : (
    <TopologyView controlBar={<TopologyControlBar controller={controller} />}>
      <VisualizationSurface state={{ selectedIds }} />
    </TopologyView>
  );
};

export default TopologyViewWorkloadComponent;
