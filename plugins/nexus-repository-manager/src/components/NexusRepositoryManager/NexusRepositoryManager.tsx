import React from 'react';
import { useAsync } from 'react-use';

import { Link, Progress, Table } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box, Chip, makeStyles } from '@material-ui/core';

import { formatByteSize, formatDate } from '@janus-idp/shared-react';

import { NexusRepositoryManagerApiRef } from '../../api';
import { useNexusRepositoryManagerAppData } from '../../hooks';
import { getFileSize, getSha256 } from '../../utils';
import { COLUMNS } from './columns';

const useStyles = makeStyles(theme => ({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export function NexusRepositoryManager() {
  const nexusClient = useApi(NexusRepositoryManagerApiRef);
  const { entity } = useEntity();
  const { ANNOTATIONS } = nexusClient.getAnnotations();

  const { title, query } = useNexusRepositoryManagerAppData({
    entity,
    ANNOTATIONS,
  });

  const classes = useStyles();

  const { value: components = [], loading } = useAsync(async () => {
    const res = await nexusClient.getComponents(query);

    return res.components;
  });

  if (loading) {
    return (
      <div data-testid="nexus-repository-manager-loading">
        <Progress />
      </div>
    );
  }

  const data = components?.map(v => {
    const { component } = v;

    // theres only one asset per docker.image-name component
    // if we want to support multiple repository types
    // this will probably need to change in the future,
    const asset = component.assets?.at(0);

    const shortHash = getSha256(asset)?.substring(0, 12);
    const size = getFileSize(v);

    return {
      version: component.version,
      repository: component.name,
      repositoryType: component.repository,
      manifestDigest: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label="sha256" className={classes.chip} />
          {shortHash}
        </Box>
      ),
      lastModified: formatDate(asset?.lastModified),
      size: formatByteSize(size),
    };
  });

  return (
    <div
      style={{ border: '1px solid #ddd' }}
      data-testid="nexus-repository-manager-table"
    >
      <Table
        title={`Nexus Repository Manager: ${title}`}
        options={{ paging: true, padding: 'dense' }}
        data={data}
        columns={COLUMNS}
        emptyContent={
          <div
            className={classes.empty}
            data-testid="nexus-repository-manager-empty-table"
          >
            No data was added yet,&nbsp;
            <Link to="https://github.com/janus-idp/backstage-plugins/blob/main/plugins/nexus-repository-manager/README.md">
              learn how to add data
            </Link>
            .
          </div>
        }
      />
    </div>
  );
}
