import React, { useState } from 'react';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import {
  Content,
  Page,
  InfoCard,
  WarningPanel,
  CodeSnippet,
  StatusOK,
  StatusError,
  Header,
} from '@backstage/core-components';
import { CircularProgress, Grid, makeStyles } from '@material-ui/core';

import { catalogApiRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { HomePageCompanyLogo } from '@backstage/plugin-home';
import { ErrorResponseBody } from '@backstage/errors';
import { ClusterOverview } from '@janus-idp/backstage-plugin-ocm-common';
import { OcmApiRef } from '../../api';

interface clusterEntity {
  status: boolean;
  entity: Entity;
}

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(5, 0),
    '& > svg': {
      width: 'auto',
      height: 150,
    },
  },
}));

const useCatalogStyles = makeStyles({
  root: {
    height: '100%',
    transition: 'all .25s linear',
    textAlign: 'center',
    '&:hover': {
      boxShadow: '0px 0px 16px 0px rgba(0,0,0,0.8)',
    },
    '& svg': {
      fontSize: 80,
    },
    '& img': {
      height: 80,
      width: 80,
      objectFit: 'contain',
    },
  },
  subheader: {
    display: 'block',
    width: '100%',
  },
  link: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
});

const CatalogClusters = () => {
  const catalogApi = useApi(catalogApiRef);
  const ocmApi = useApi(OcmApiRef);
  const classes = useCatalogStyles();

  const [clusterEntities, setClusterEntities] = useState<clusterEntity[]>([]);
  const [{ loading, error }, refresh] = useAsyncFn(
    async () => {
      const clusterResourceEntities = await catalogApi.getEntities({
        filter: { kind: 'Resource', 'spec.type': 'kubernetes-cluster' },
      });

      const clusters = await ocmApi.getClusters();

      if ('error' in clusters) {
        throw new Error((clusters as ErrorResponseBody).error.message);
      }

      setClusterEntities(
        clusterResourceEntities.items.map(entity => {
          const cluster = (clusters as ClusterOverview[]).find(
            cd => cd.name === entity.metadata.name,
          );
          return {
            status: cluster?.status.available!,
            entity: entity,
          };
        }),
      );
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

  return (
    <>
      {clusterEntities.map(clusterEntity => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          xl={2}
          key={clusterEntity.entity.metadata.name}
        >
          <EntityRefLink
            entityRef={clusterEntity.entity}
            className={classes.link}
          >
            <InfoCard
              divider={false}
              noPadding
              className={classes.root}
              title={
                <div className={classes.subheader}>
                  {clusterEntity.status === true ? (
                    <StatusOK />
                  ) : (
                    <StatusError />
                  )}
                  {clusterEntity.entity.metadata.title ||
                    clusterEntity.entity.metadata.name}
                </div>
              }
            />
          </EntityRefLink>
        </Grid>
      ))}
    </>
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
            <HomePageCompanyLogo className={container} logo={logo} />
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
