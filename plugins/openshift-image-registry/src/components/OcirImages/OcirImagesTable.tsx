import * as React from 'react';
import { Table } from '@backstage/core-components';
import { columns } from './tableHeading';
import { useAllImageStreams } from '../../hooks/useAllImageStreams';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useStyles } from '../../utils';

type OcirImagesTableProps = {
  namespaces: any;
};

export const OcirImagesTable: React.FunctionComponent<OcirImagesTableProps> = ({
  namespaces,
}) => {
  const classes = useStyles();
  const [namespace, setNamespace] = React.useState<string>(
    localStorage.getItem('activeNamespace') ?? namespaces[0]?.value,
  );

  const { loading, imageStreamsData } = useAllImageStreams(namespace);

  const tableTitle = (
    <div style={{ display: 'flex', flexFlow: 'column' }}>
      <span>Images</span>
      {namespaces.length && (
        <FormControl size="small" style={{ minWidth: '105px' }}>
          <InputLabel>Namespace</InputLabel>
          <Select
            value={namespace}
            label="Namespace"
            onChange={(e: React.ChangeEvent<any>) => {
              localStorage.setItem('activeNamespace', e.target.value);
              setNamespace(e.target.value);
            }}
          >
            {namespaces.map((n: any, index: number) => (
              <MenuItem key={index} value={n.value}>
                {n.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );

  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title={tableTitle}
        options={{ paging: true, padding: 'dense' }}
        data={imageStreamsData}
        columns={columns}
        isLoading={loading}
        emptyContent={
          <div className={classes.empty}>
            No images found in the openshift internal registry
          </div>
        }
      />
    </div>
  );
};
