import React from 'react';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import { Link, Table } from '@backstage/core-components';

const convertToGibibytes = (kibibytes: string): string => {
  const sizeInKibibytes = parseInt(
    kibibytes.substring(0, kibibytes.length - 2),
    10,
  );
  return `${(sizeInKibibytes / 2 ** 20).toFixed(0)} Gi`;
};

const valueFormatter = (value: any): any => {
  if (typeof value === 'string') {
    if (value.slice(-2) === 'Ki') {
      return convertToGibibytes(value);
    } else if (value.slice(0, 4) === 'http') {
      return <Link to={value}>{value}</Link>;
    }
  }
  return value.toString();
};

export const TableCardFromData = ({
  data,
  title,
  nameMap,
}: {
  data: any;
  title: string;
  nameMap: Map<string, string>;
}) => {
  const parsedData: { name: string; value: string }[] = [];
  const entries = Object.entries(data);

  nameMap.forEach((_, key) => {
    const entry = entries.find(e => e[0] === key)!;
    // If key of the map doesnt have an prop in the cluster object, continue
    if (entry === undefined) {
      return;
    }
    parsedData.push({
      // entry[0] === name of the prop
      name: nameMap.get(entry[0])!,
      // entry[1] === value of the prop
      value: valueFormatter(entry[1]),
    });
  });

  if (parsedData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent style={{ padding: 0 }}>
        <Table
          options={{
            search: false,
            paging: false,
            toolbar: false,
            header: false,
            padding: 'dense',
          }}
          data={parsedData}
          columns={[
            {
              field: 'name',
              highlight: true,
              width: '15%',
              cellStyle: { whiteSpace: 'nowrap' },
            },
            { field: 'value' },
          ]}
        />
      </CardContent>
    </Card>
  );
};
