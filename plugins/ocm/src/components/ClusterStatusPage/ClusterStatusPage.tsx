import React, { ReactElement } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import {
  CodeSnippet,
  Content,
  Header,
  Page,
  StatusAborted,
  StatusError,
  StatusOK,
  Table,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import { HomePageCompanyLogo } from '@backstage/plugin-home';
import { SearchContextProvider } from '@backstage/plugin-search-react';

import { Chip, CircularProgress, Grid, makeStyles } from '@material-ui/core';

import {
  ClusterNodesStatus,
  ClusterOverview,
} from '@janus-idp/backstage-plugin-ocm-common';

import { OcmApiRef } from '../../api';
import { Status, Update } from '../common';

const useStylesTwo = makeStyles({
  container: {
    width: '100%',
  },
});

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(5, 0),
    '& > svg': {
      width: 'auto',
      height: 150,
    },
  },
}));

const NodeChip = ({
  count,
  indicator,
}: {
  count: number;
  indicator: ReactElement;
}) => (
  <>
    {count > 0 ? (
      <>
        <Chip
          label={
            <>
              {indicator}
              {count}
            </>
          }
          variant="outlined"
        />
      </>
    ) : (
      <></>
    )}
  </>
);

const NodeChips = ({ nodes }: { nodes: ClusterNodesStatus[] }) => {
  const readyChipsNodes = nodes.filter(node => node.status === 'True').length;
  // TODO: Check if not ready correctly
  const notReadyNodesCount = nodes.filter(
    node => node.status === 'False',
  ).length;

  if (nodes.length === 0) {
    return <>-</>;
  }

  return (
    <>
      <NodeChip count={readyChipsNodes} indicator={<StatusOK />} />
      <NodeChip count={notReadyNodesCount} indicator={<StatusError />} />
      <NodeChip
        count={nodes.length - readyChipsNodes - notReadyNodesCount}
        indicator={<StatusAborted />}
      />
    </>
  );
};

const CatalogClusters = () => {
  const catalogApi = useApi(catalogApiRef);
  const ocmApi = useApi(OcmApiRef);
  const classes = useStylesTwo();

  const [{ value: clusterEntities, loading, error }, refresh] = useAsyncFn(
    async () => {
      const clusterResourceEntities = await catalogApi.getEntities({
        filter: { kind: 'Resource', 'spec.type': 'kubernetes-cluster' },
      });

      const clusters = await ocmApi.getClusters();

      if ('error' in clusters) {
        throw new Error(clusters.error.message);
      }

      const clusterEntityMappings = clusterResourceEntities.items.map(
        entity => {
          const cluster = (clusters as ClusterOverview[]).find(
            cd => cd.name === entity.metadata.name,
          );
          return {
            cluster: cluster!,
            entity: entity,
          };
        },
      );
      return clusterEntityMappings;
    },
    [catalogApi],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not fetch clusters from Hub.">
        <CodeSnippet language="text" text={error.toString()} />
      </WarningPanel>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  const data = clusterEntities
    ? clusterEntities.map(ce => {
        return {
          name: (
            <EntityRefLink entityRef={ce.entity}>
              {ce.cluster.name}
            </EntityRefLink>
          ),
          status: <Status status={ce.cluster.status} />,
          infrastructure: ce.cluster.platform,
          version: (
            <Update
              data={{
                version: ce.cluster.openshiftVersion,
                update: ce.cluster.update,
              }}
            />
          ),
          nodes: <NodeChips nodes={ce.cluster.nodes} />,
        };
      })
    : [];

  return (
    <div className={classes.container}>
      <Table
        options={{ paging: false }}
        data={data}
        columns={[
          {
            title: 'Name',
            field: 'name',
            highlight: true,
          },
          {
            title: 'Status',
            field: 'status',
          },
          {
            title: 'Infrastructure',
            field: 'infrastructure',
          },
          {
            title: 'Version',
            field: 'version',
          },
          {
            title: 'Nodes',
            field: 'nodes',
          },
        ]}
        title="All"
      />
    </div>
  );
};

export const ClusterStatusPage = ({ logo }: { logo?: React.ReactNode }) => {
  const { container } = useStyles();

  return (
    <SearchContextProvider>
      <Page themeId="clusters">
        <Header title="Your Managed Clusters" />
        <Content>
          <Grid container justifyContent="center" spacing={6}>
            {logo && <HomePageCompanyLogo className={container} logo={logo} />}
            <Grid container item xs={12} justifyContent="center">
              <CatalogClusters />
            </Grid>
          </Grid>
        </Content>
      </Page>
    </SearchContextProvider>
  );
};

export default ClusterStatusPage;
