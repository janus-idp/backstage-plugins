import * as React from 'react';

import {
  Paper,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
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
  tableToolbar?: React.ReactNode;
  type: string;
};

export const VirtualList = (listProps: VirtualListProps<RenderResource>) => {
  // @ts-ignore
  const conf = config[listProps.type] as Resource;
  const [order, setOrder] = React.useState<SortDirection>('asc');
  const [orderBy, setOrderBy] = React.useState<String>('');

  const getColumns = (): ResourceType<any>[] => {
    let columns = [] as ResourceType<any>[];
    if (conf.columns) {
      columns = conf.columns.filter(
        info =>
          !listProps.hiddenColumns ||
          !listProps.hiddenColumns.includes(info.title.toLowerCase()),
      );
    }
    return columns;
  };
  const columns = getColumns();

  const { rows } = listProps;
  const typeDisplay =
    listProps.type === 'istio' ? 'Istio config' : listProps.type;

  const tableHeaderStyle: any = {
    minWidth: '120px',
    fontWeight: '700',
    color: 'grey',
    borderTop: '1px solid #d5d5d5',
    borderBottom: '1px solid #d5d5d5',
    whiteSpace: 'nowrap',
  };

  function descendingComparator(a: string, b: string): number {
    if (b < a) {
      return -1;
    }
    if (b > a) {
      return 1;
    }
    return 0;
  }

  function getComparator(): any {
    return order === 'desc'
      ? (a: string, b: string) => descendingComparator(a, b)
      : (a: string, b: string) => -descendingComparator(a, b);
  }

  function stableSort(
    array: RenderResource[],
    comparator: any,
  ): RenderResource[] {
    const stabilizedThis: [RenderResource, number][] = array.map(
      (el, index) => [el, index],
    );
    stabilizedThis.sort(
      (a: [RenderResource, number], b: [RenderResource, number]): number => {
        // @ts-ignore
        const aProp = a[0][orderBy];
        // @ts-ignore
        const bProp = b[0][orderBy];
        if (aProp === undefined || bProp === undefined) {
          return 0;
        }
        const sort = comparator(aProp, bProp);
        if (sort !== 0) return sort;
        return a[1] - b[1];
      },
    );
    return stabilizedThis.map(el => el[0]);
  }

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property.toLowerCase());
  };

  return (
    <div>
      <Paper className="Paper">
        {listProps.tableToolbar}
        <TableContainer>
          <Table>
            <TableHead style={{ border: 'collapse', background: 'white' }}>
              <TableRow>
                {columns.map((column: ResourceType<any>, index: number) => (
                  <TableCell
                    key={`column_${index}`}
                    align="center"
                    style={tableHeaderStyle}
                    sortDirection={
                      column.sortable && orderBy === column.title.toLowerCase()
                        ? order
                        : false
                    }
                  >
                    <TableSortLabel
                      active={orderBy === column.title.toLowerCase()}
                      // @ts-ignore
                      direction={
                        orderBy === column.title.toLowerCase() ? order : 'asc'
                      }
                      onClick={e =>
                        handleRequestSort(e, column.title.toLowerCase())
                      }
                    >
                      {column.title.toUpperCase()}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {listProps.rows.length > 0 ? (
                stableSort(rows, getComparator()).map(
                  (row: RenderResource, index: number) => (
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
                  ),
                )
              ) : (
                <TableRow className={emptyStyle}>
                  <TableCell colSpan={columns.length}>
                    {listProps.activeNamespaces.length > 0
                      ? `No ${typeDisplay} in namespace 
                  ${
                    listProps.activeNamespaces.length === 1
                      ? ` ${listProps.activeNamespaces[0].name}`
                      : `s: ${listProps.activeNamespaces
                          .map(ns => ns.name)
                          .join(', ')}`
                  }`
                      : `There is currently no namespace selected, please select one using the Namespace selector.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};
