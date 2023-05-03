import * as React from 'react';
import { TableColumn } from '@backstage/core-components';
import { Box, Chip, makeStyles } from '@material-ui/core';

const useLocalStyles = makeStyles({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
});

export const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
  },
  {
    title: 'Manifest',
    field: 'manifest_digest',
    type: 'string',
    render: (row: any) => {
      const Manifest = () => {
        const hashFunc = row.manifest_digest.substring(0, 6);
        const shortHash = row.manifest_digest.substring(7, 19);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={hashFunc} className={useLocalStyles().chip} />
            {shortHash}
          </Box>
        );
      };

      return <Manifest />;
    },
  },
];
