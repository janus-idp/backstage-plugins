import React from 'react';

export const ReviewStepTable = ({
  columns,
  rows,
  tableWrapperWidth,
}: {
  columns: any[];
  rows: any[];
  tableWrapperWidth: number;
}) => {
  return (
    <div
      style={{
        maxHeight: '230px',
        overflow: 'auto',
        width: `${tableWrapperWidth}px`,
      }}
    >
      <table style={{ width: `${tableWrapperWidth - 50}px` }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th style={{ width: '150px' }} key={col.title}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <tr>
                {columns.map(rowCol => (
                  <td
                    style={{ width: '150px' }}
                    key={`${rowCol.title}-${rowCol.field}`}
                  >
                    {rowCol.render
                      ? rowCol.render(row[rowCol.field])
                      : row[rowCol.field] || (rowCol.emptyValue ?? '')}
                  </td>
                ))}
              </tr>
              <tr />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
