import * as React from 'react';

import {
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
} from '@material-ui/core';

import { kialiStyle } from '../styles/StyleUtils';

export interface SortableTh extends TableCellProps {
  sortable: boolean;
}

export type tRow = {
  cells: React.JSX.Element[];
  key?: string;
  className?: string;
}[];

interface SimpleTableProps {
  className?: string;
  columns: SortableTh[] | TableCellProps[];
  emptyState?: React.ReactNode;
  label: string;
  rows: tRow;
  sort?: (columnIndex: number) => TableCellProps['sortDirection'];
  sortBy?: SortDirection;
  variant?: string;
  verticalAlign?: string;
}

export const SimpleTable: React.FC<SimpleTableProps> = (
  props: SimpleTableProps,
) => {
  const tdStyle = kialiStyle({
    verticalAlign: props.verticalAlign ?? 'baseline',
  });

  return (
    <Table className={props.className}>
      {!props.emptyState && (
        <TableHead>
          <TableRow>
            {props.columns.map(
              (column: SortableTh | TableCellProps, index: number) => (
                <TableCell
                  key={column.title ?? `column_${index}`}
                  width={column.width}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <b>{column.title}</b>
                </TableCell>
              ),
            )}
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {props.rows.length > 0 ? (
          props.rows.map((row, rowIndex) => (
            <TableRow
              key={row.key ?? `row_${rowIndex}`}
              className={row.className}
            >
              {row.cells?.map((cell: React.ReactNode, colIndex: number) => (
                <TableCell
                  key={`cell_${rowIndex}_${colIndex}`}
                  className={tdStyle}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <>
            {props.emptyState && (
              <TableRow>
                <TableCell colSpan={props.columns.length}>
                  {props.emptyState}
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};
