import { VirtualTableBody } from '@patternfly/react-virtualized-extension';
import { Scroll } from '@patternfly/react-virtualized-extension/dist/esm/components/Virtualized/types';
import * as React from 'react';
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';
import { TableRow } from './TableRow';

import './VirtualBody.css';

type RowFunctionArgs<T = any> = {
  obj: T;
};

export type VirtualBodyProps<D = any, C = any> = {
  customData?: C;
  Row: React.FC<RowFunctionArgs>;
  height: number;
  isScrolling: boolean;
  data: D[];
  columns: any[];
  width: number;
  expand: boolean;
  onChildScroll: (params: Scroll) => void;
  scrollTop: number;
  getRowProps?: (obj: D) => {
    id: React.ReactText;
    title?: string;
  };
};

export const RowMemo = React.memo<
  RowFunctionArgs & { Row: React.FC<RowFunctionArgs> }
>(({ Row, ...props }) => <Row {...props} />);

export const VirtualBody = (props: VirtualBodyProps) => {
  const {
    customData,
    Row,
    height,
    isScrolling,
    data,
    columns,
    width,
    getRowProps,
    onChildScroll,
    scrollTop,
  } = props;

  const cellMeasurementCache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 44,
    keyMapper: (rowIndex: any) =>
      props.data?.[rowIndex]?.metadata?.uid || rowIndex,
  });

  const rowRenderer = ({
    index,
    isVisible,
    key,
    style,
    parent,
  }: {
    index: number;
    key: string;
    style?: React.CSSProperties | undefined;
    parent: MeasuredCellParent;
    isVisible: boolean;
  }) => {
    const rowArgs = {
      obj: data[index],
      columns,
      customData,
    };
    // do not render non visible elements (this excludes overscan)
    if (!isVisible) {
      return null;
    }

    const rowProps = getRowProps?.(rowArgs.obj);
    const rowId = rowProps?.id ?? key;
    return (
      <CellMeasurer
        cache={cellMeasurementCache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <TableRow
          {...rowProps}
          id={rowId}
          index={index}
          trKey={key}
          style={style}
        >
          <RowMemo Row={Row} {...rowArgs} />
        </TableRow>
      </CellMeasurer>
    );
  };

  return (
    <VirtualTableBody
      autoHeight
      className="pf-c-table pf-c-virtualized pf-c-window-scroller pf-m-compact pf-m-border-rows"
      deferredMeasurementCache={cellMeasurementCache}
      rowHeight={cellMeasurementCache.rowHeight}
      height={height || 0}
      isScrolling={isScrolling}
      overscanRowCount={10}
      columns={columns}
      rows={data}
      rowCount={data?.length}
      rowRenderer={rowRenderer}
      width={width}
      onScroll={onChildScroll}
      scrollTop={scrollTop}
    />
  );
};
