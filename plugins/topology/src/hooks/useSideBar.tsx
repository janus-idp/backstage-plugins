import React from 'react';
import { BaseNode } from '@patternfly/react-topology';
import { TYPE_WORKLOAD } from '../const';
import TopologySideBar from '../components/Topology/TopologySideBar/TopologySideBar';

export const useSideBar = (): [
  React.ReactNode,
  boolean,
  string,
  React.Dispatch<React.SetStateAction<boolean>>,
  React.Dispatch<React.SetStateAction<BaseNode | null>>,
  () => void,
] => {
  const { search } = window.location;
  const [sideBarOpen, setSideBarOpen] = React.useState<boolean>(false);
  const [selectedNode, setSelectedNode] = React.useState<BaseNode | null>(null);

  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const selectedId = params.get('selectedId') ?? '';

  const removeSelectedIdParam = React.useCallback(() => {
    params.delete('selectedId');
    const url = new URL(window.location.href);
    history.replaceState(
      null,
      '',
      `${url.pathname}${params.toString()}${url.hash}`,
    );
  }, [params]);

  const sideBar = selectedNode && selectedNode.getType() === TYPE_WORKLOAD && (
    <TopologySideBar
      onClose={() => {
        setSideBarOpen(false);
        removeSelectedIdParam();
      }}
      node={selectedNode}
    />
  );

  return [
    sideBar,
    sideBarOpen,
    selectedId,
    setSideBarOpen,
    setSelectedNode,
    removeSelectedIdParam,
  ];
};
