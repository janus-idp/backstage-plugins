import * as React from 'react';
import {
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  SelectionEventListener,
  SELECTION_EVENT,
  TopologyControlBar,
  TopologySideBar,
  TopologyView,
  useEventListener,
  useVisualizationController,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';
import defaultLayoutFactory from './layouts/defaultLayoutFactory';
import TopologyComponentFactory from './components/TopologyComponentFactory';
import { updateTopologyDataModel } from './data-transforms/updateTopologyDataModel';
import { mockWatchedRes } from '../../data/mock-watched-res';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import { getResources } from './utils/topology-utils';

interface TopologyViewWorkloadComponentProps {
  useSidebar: boolean;
  sideBarResizable?: boolean;
}

const TopologyViewWorkloadComponent: React.FunctionComponent<
  TopologyViewWorkloadComponentProps
> = ({ useSidebar, sideBarResizable = false }) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const controller = useVisualizationController();
  const [dataModel, setDataModel] = React.useState({});
  const { entity } = useEntity();
  const { kubernetesObjects, error } = useKubernetesObjects(entity);
  const layout = 'ColaNoForce';

  React.useEffect(() => {
    const fetchData = async () => {
      if (kubernetesObjects && !error) {
        const k8sResources = getResources(kubernetesObjects);
        const watchedRes = mockWatchedRes();
        const dataModelRes = await updateTopologyDataModel(
          k8sResources,
          watchedRes,
        );
        if (dataModelRes.model) {
          setDataModel(dataModelRes.model);
        }
      }
    };

    fetchData();
    // Don't update on option changes, its handled differently to not re-layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kubernetesObjects, error]);

  React.useEffect(() => {
    if (dataModel) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, dataModel]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, ids => {
    setSelectedIds(ids);
  });

  const topologySideBar = (
    <TopologySideBar
      show={selectedIds.length > 0}
      resizable={sideBarResizable}
      onClose={() => setSelectedIds([])}
    >
      <div style={{ marginTop: 27, marginLeft: 20, overflow: 'auto' }}>
        {selectedIds[0]}
      </div>
    </TopologySideBar>
  );

  return (
    <TopologyView
      controlBar={
        <TopologyControlBar
          controlButtons={createTopologyControlButtons({
            ...defaultControlButtonsOptions,
            zoomInCallback: action(() => {
              controller.getGraph().scaleBy(4 / 3);
            }),
            zoomOutCallback: action(() => {
              controller.getGraph().scaleBy(0.75);
            }),
            fitToScreenCallback: action(() => {
              controller.getGraph().fit(80);
            }),
            resetViewCallback: action(() => {
              controller.getGraph().reset();
              controller.getGraph().layout();
            }),
            legend: false,
          })}
        />
      }
      sideBar={useSidebar && topologySideBar}
      sideBarOpen={useSidebar && selectedIds.length > 0}
      sideBarResizable={sideBarResizable}
    >
      <VisualizationSurface state={{ selectedIds }} />
    </TopologyView>
  );
};

export const TopologyWorkloadPackage = React.memo(() => {
  const controller = new Visualization();
  controller.registerLayoutFactory(defaultLayoutFactory);
  controller.registerComponentFactory(TopologyComponentFactory);

  return (
    <VisualizationProvider controller={controller}>
      <TopologyViewWorkloadComponent useSidebar sideBarResizable />
    </VisualizationProvider>
  );
});
