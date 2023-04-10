import * as React from 'react';
import { BaseNode } from '@patternfly/react-topology';
import { TYPE_WORKLOAD } from '../const';
import TopologySideBar from '../components/Topology/TopologySideBar/TopologySideBar';

export const useSideBar = (
  selectedIds: string[],
): [
  React.ReactNode,
  boolean,
  string,
  React.Dispatch<React.SetStateAction<boolean>>,
  React.Dispatch<React.SetStateAction<BaseNode | null>>,
] => {
  const { search } = window.location;
  const [sideBarOpen, setSideBarOpen] = React.useState<boolean>(false);
  const [selectedNode, setSelectedNode] = React.useState<BaseNode | null>(null);

  const params = React.useMemo(() => new URLSearchParams(search), [search]);

  const removeSelectedIdParam = React.useCallback(() => {
    params.delete('selectedId');
    const url = new URL(window.location.href);
    history.replaceState(
      null,
      '',
      `${url.pathname}${params.toString()}${url.hash}`,
    );
  }, [params]);

  const selectedId = React.useMemo((): string => {
    const id = params.get('selectedId') ?? '';
    if (selectedIds?.length && selectedIds.includes(id)) {
      return id;
    }
    removeSelectedIdParam();
    return '';
  }, [params, removeSelectedIdParam, selectedIds]);

  const sideBar = selectedNode && selectedNode.getType() === TYPE_WORKLOAD && (
    <TopologySideBar
      onClose={() => {
        setSideBarOpen(false);
        removeSelectedIdParam();
      }}
      node={selectedNode}
    />
  );

  return [sideBar, sideBarOpen, selectedId, setSideBarOpen, setSelectedNode];
};
