import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';

import { kialiStyle } from '../../styles/StyleUtils';
import { Namespace } from '../../types/Namespace';
import { NamespaceInfo } from '../../types/NamespaceInfo';
import { SortField } from '../../types/SortFilters';
import { StatefulFiltersProps } from '../Filters/StatefulFilters';
import { config, RenderResource, Resource, ResourceType } from './Config';
import { VirtualItem } from './VirtualItem';

const emptyStyle = kialiStyle({
  borderBottom: 0,
});

// ******************************
// VirtualList and its associated classes are intended to be used for main list pages: Applications,
// Workloads, Services and Istio Config. They share common style and filter integration. They have
// have limitations in scenarios where different personalization is needed (columns style, or layout).
// For a secondary list, rendered inside a detail page, it is recommended the imple be based on a
// Table component, such as in WorkloadServices, WorkloadPods, ServiceInfoWorkload, IstioConfigSubList,
// or TrafficListComponent.
// ******************************

type VirtualListProps<R> = {
  actions?: JSX.Element[];
  activeNamespaces: Namespace[];
  children?: React.ReactNode;
  hiddenColumns?: string[];
  rows: R[];
  sort?: (sortField: SortField<NamespaceInfo>, isAscending: boolean) => void;
  statefulProps?: StatefulFiltersProps;
  type: string;
};

export const VirtualList = (listProps: VirtualListProps<RenderResource>) => {
  // @ts-ignore
  const conf = config[listProps.type] as Resource;
  const getColumns = (): ResourceType<any>[] => {
    let columns = [] as ResourceType<any>[];

    if (conf.columns) {
      columns = conf.columns.filter((info: { title: string }) =>
        info.title.toLowerCase(),
      );
    }

    return columns;
  };
  const columns = getColumns();

  const { rows } = listProps;
  const typeDisplay =
    listProps.type === 'istio' ? 'Istio config' : listProps.type;

  const rowItems = rows.map((row, index) => (
    <VirtualItem
      key={`vItem_${index}`}
      item={row}
      index={index}
      columns={columns}
      config={conf}
      statefulFilterProps={listProps.statefulProps}
      action={
        listProps.actions && listProps.actions[index]
          ? listProps.actions[index]
          : undefined
      }
    />
  ));

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={`column_${index}`}>{column.title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {listProps.rows.length > 0 ? (
            rowItems
          ) : (
            <TableRow className={emptyStyle}>
              <TableCell colSpan={columns.length}>
                {listProps.activeNamespaces.length > 0
                  ? `No ${typeDisplay} in namespace 
        ${
          listProps.activeNamespaces.length === 1
            ? ` ${listProps.activeNamespaces[0].name}`
            : `s: ${listProps.activeNamespaces.map(ns => ns.name).join(', ')}`
        }`
                  : `There is currently no namespace selected, please select one using the Namespace selector.`}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
