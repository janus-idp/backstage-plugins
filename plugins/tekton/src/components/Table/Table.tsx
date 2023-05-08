import {
  OnSelect,
  Table as PfTable,
  TableGridBreakpoint,
  TableHeader,
} from '@patternfly/react-table';
import {
  AutoSizer,
  WindowScroller,
} from '@patternfly/react-virtualized-extension';
import { Scroll } from '@patternfly/react-virtualized-extension/dist/esm/components/Virtualized/types';
import { findIndex } from 'lodash';
import * as React from 'react';
import { useTableData } from '../../hooks/useTableData';
import { WithScrollContainer } from '../../utils/WithScrollContainer';
import { VirtualBody } from './VirtualBody';

type HeaderFunc = () => any[];

type TableProps<D = any, C = any> = Partial<D> & {
  'aria-label': string;
  header: HeaderFunc;
  Row: React.FC<{ obj: any }>;
  customData?: C;
  expand?: boolean;
  scrollElement?: HTMLElement | (() => HTMLElement);
  getRowProps?: (obj: D) => {
    id: React.ReactText;
    title?: string;
  };
  onSelect?: OnSelect;
};

export const Table = ({
  header,
  Row,
  customData,
  expand,
  getRowProps,
  data: propData,
  'aria-label': ariaLabel,
  defaultSortField,
  defaultSortOrder,
  scrollElement,
  gridBreakPoint = TableGridBreakpoint.none,
  onSelect,
}: TableProps) => {
  const [sortBy, setSortBy] = React.useState({});
  const [currentSortField, setCurrentSortField] =
    React.useState(defaultSortField);
  const [currentSortOrder, setCurrentSortOrder] =
    React.useState(defaultSortOrder);

  const { data } = useTableData({
    propData,
    sortField: currentSortField,
    sortOrder: currentSortOrder,
  });
  const columns = header();
  const ariaRowCount = data && data.length;
  const scrollNode =
    typeof scrollElement === 'function' ? scrollElement() : scrollElement;
  const columnShift = onSelect ? 1 : 0;

  React.useEffect(() => {
    if (!sortBy) {
      let newSortBy = {};
      if (currentSortField && currentSortOrder) {
        const columnIndex = findIndex(columns, {
          sortField: currentSortField,
        });
        if (columnIndex > -1) {
          newSortBy = {
            index: columnIndex + columnShift,
            direction: currentSortOrder,
          };
        }
      }
      setSortBy(newSortBy);
    }
  }, [columnShift, columns, currentSortField, currentSortOrder, sortBy]);

  const applySort = React.useCallback(
    (sortField, _sortFunc, direction, _columnTitle) => {
      setCurrentSortField?.(sortField);
      setCurrentSortOrder?.(direction);
    },
    [setCurrentSortField, setCurrentSortOrder],
  );

  const onSort = React.useCallback(
    (event, index, direction) => {
      event.preventDefault();
      const sortColumn = columns[index - columnShift];
      applySort(
        sortColumn.sortField,
        sortColumn.sortFunc,
        direction,
        sortColumn.title,
      );
      setSortBy({
        index,
        direction,
      });
    },
    [applySort, columnShift, columns],
  );

  const renderVirtualizedTable = (
    scrollContainer: Element | (Window & typeof globalThis) | undefined,
  ) => (
    <WindowScroller scrollElement={scrollContainer}>
      {({
        height,
        isScrolling,
        registerChild,
        onChildScroll,
        scrollTop,
      }: {
        height: number;
        isScrolling: boolean;
        registerChild: React.LegacyRef<HTMLDivElement> | undefined;
        onChildScroll: (params: Scroll) => void;
        scrollTop: number;
      }) => (
        <AutoSizer disableHeight>
          {({ width }: { width: number }) => (
            <div ref={registerChild}>
              <VirtualBody
                Row={Row}
                customData={customData}
                height={height}
                isScrolling={isScrolling}
                data={data}
                columns={columns}
                width={width}
                expand={!!expand}
                getRowProps={getRowProps}
                onChildScroll={onChildScroll}
                scrollTop={scrollTop}
              />
            </div>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );

  return (
    <div
      aria-label={ariaLabel}
      role="grid"
      className="pf-c-scrollablegrid"
      aria-rowcount={ariaRowCount}
    >
      <PfTable
        cells={columns}
        rows={[]}
        gridBreakPoint={gridBreakPoint}
        className="pf-m-border-rows"
        role="presentation"
        onSort={onSort}
        onSelect={onSelect}
        sortBy={sortBy}
      >
        <TableHeader role="rowgroup" />
      </PfTable>
      {scrollNode ? (
        renderVirtualizedTable(scrollNode)
      ) : (
        <WithScrollContainer>{renderVirtualizedTable}</WithScrollContainer>
      )}
    </div>
  );
};
