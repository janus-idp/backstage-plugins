import * as React from 'react';

import {
  makeStyles,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { Order } from '../../types/types';
import { PipelineRunColumnHeader } from './PipelineRunColumnHeader';

type EnhancedTableProps = {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: string,
    id: string,
  ) => void;
  order: Order;
  orderBy: string;
  orderById: string;
};

const useStyles = makeStyles(theme => ({
  header: {
    padding: theme.spacing(1, 2, 1, 2.5),
    borderTop: `1px solid ${theme.palette.grey.A100}`,
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
    // withStyles hasn't a generic overload for theme
    fontWeight: 'bold',
    position: 'static',
    wordBreak: 'normal',
  },
}));

export const EnhancedTableHead = ({
  order,
  orderBy,
  orderById,
  onRequestSort,
}: EnhancedTableProps) => {
  const createSortHandler =
    (property: string, id: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property, id);
    };
  const classes = useStyles();

  return (
    <TableHead>
      <TableRow>
        {PipelineRunColumnHeader.map(headCell => {
          return (
            <TableCell
              className={classes.header}
              key={headCell.id as string}
              align="left"
              padding="normal"
              sortDirection={
                orderBy === headCell.field ? headCell.defaultSort : false
              }
            >
              {headCell.field ? (
                <TableSortLabel
                  active={
                    orderBy === headCell.field && orderById === headCell.id
                  }
                  direction={order}
                  onClick={createSortHandler(
                    headCell.field as string,
                    headCell.id as string,
                  )}
                >
                  {headCell.title}
                </TableSortLabel>
              ) : (
                <> {headCell.title}</>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
