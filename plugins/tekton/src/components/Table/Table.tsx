import * as React from 'react';
import {
  Table as PfTable,
  TableHeader,
  TableGridBreakpoint,
} from '@patternfly/react-table';
import {
  AutoSizer,
  WindowScroller,
} from '@patternfly/react-virtualized-extension';
import { Scroll } from '@patternfly/react-virtualized-extension/dist/esm/components/Virtualized/types';
import { VirtualBody } from './VirtualBody';
import { useTableData } from '../../hooks/useTableData';
import { WithScrollContainer } from '../../utils/WithScrollContainer';

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
};

export const Table: React.FC<TableProps> = ({
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
}) => {
  const { data } = useTableData({
    propData,
    defaultSortField,
    defaultSortOrder,
  });
  const columns = header();
  const ariaRowCount = data && data.length;
  const scrollNode =
    typeof scrollElement === 'function' ? scrollElement() : scrollElement;

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
