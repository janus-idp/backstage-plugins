import React from 'react';

export const ReviewStepTable = ({
  columns,
  rows,
}: {
  columns: any[];
  rows: any[];
}) => {
  return (
    <div style={{ maxHeight: '230px', overflow: 'scroll', width: '650px' }}>
      <table style={{ width: '600px' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th style={{ width: '200px' }} key={col.title}>
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
                    style={{ width: '200px' }}
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
