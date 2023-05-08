import * as React from 'react';

type TableRowProps = {
  id: React.ReactText;
  index: number;
  title?: string;
  trKey: string;
  style: React.CSSProperties | undefined;
  className?: string;
};

export const TableRow = ({
  id,
  index,
  trKey,
  style,
  className,
  ...props
}: React.PropsWithChildren<TableRowProps>) => {
  return (
    <tr
      {...props}
      data-id={id}
      data-index={index}
      data-test-rows="resource-row"
      data-key={trKey}
      style={style}
      className={className}
      role="row"
    />
  );
};
