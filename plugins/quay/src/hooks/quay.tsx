/* eslint-disable no-console */
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { Box, Chip, makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useQuayStore } from './state';
import { useAsync } from 'react-use';
import { quayApiRef } from '../api';
import { formatDate, formatSize } from '../lib/utils';
import { Tag } from '../types';
import { useEntity } from '@backstage/plugin-catalog-react';

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

export const useTags = (organization: string, repository: string) => {
  // eslint-disable-next-line no-console
  const quayClient = useApi(quayApiRef);
  const { repoTags, setRepoTags, setTagManifestLayers, tagManifestLayers } =
    useQuayStore();
  const localClasses = useLocalStyles();
  const repoKey = `${organization}/${repository}`;

  const fetchSecurityDetails = async (tag: Tag) => {
    const securityDetails = await quayClient.getSecurityDetails(
      organization,
      repository,
      tag.manifest_digest,
    );
    return securityDetails;
  };

  const { loading } = useAsync(async () => {
    // eslint-disable-next-line no-console
    const tagsResponse = await quayClient.getTags(organization, repository);
    Promise.all(
      tagsResponse.tags.map(async tag => {
        const securityDetails = await fetchSecurityDetails(tag);
        if (!securityDetails.data) {
          return;
        }
        setTagManifestLayers(tag.manifest_digest, securityDetails.data.Layer);
      }),
    );
    if (tagsResponse.page === 1) {
      setRepoTags(organization, repository, tagsResponse.tags);
    } else {
      const mergedTags = [...repoTags[repoKey], ...tagsResponse.tags];
      setRepoTags(organization, repository, mergedTags);
    }
    return tagsResponse;
  });

  const data = useMemo(() => {
    if (!repoTags[repoKey]) {
      return [];
    }
    return Object.values(repoTags[repoKey])?.map(tag => {
      const hashFunc = tag.manifest_digest.substring(0, 6);
      const shortHash = tag.manifest_digest.substring(7, 19);
      // console.log('tag.securityDetails', tag.securityDetails);
      console.log('tag', tag);
      return {
        name: tag.name,
        last_modified: formatDate(tag.last_modified),
        size: formatSize(tag.size),
        manifest_digest: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={hashFunc} className={localClasses.chip} />
            {shortHash}
          </Box>
        ),
        expiration: tag.expiration,
        securityDetails: tagManifestLayers[tag.manifest_digest],
        manifest_digest_raw: tag.manifest_digest,
        // is_manifest_list: tag.is_manifest_list,
        // reversion: tag.reversion,
        // start_ts: tag.start_ts,
        // end_ts: tag.end_ts,
        // manifest_list: tag.manifest_list,
      };
    });
  }, [repoTags, repoKey, localClasses, tagManifestLayers]);

  return { loading, data };
};

export const QUAY_ANNOTATION_REPOSITORY = 'quay.io/repository-slug';

export const useQuayAppData = ({ entity }: { entity: Entity }) => {
  const repositorySlug =
    entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY] ?? '';

  if (!repositorySlug) {
    throw new Error("'Quay' annotations are missing");
  }
  return { repositorySlug };
};

export const useRepository = () => {
  const { entity } = useEntity();
  const { repositorySlug } = useQuayAppData({ entity });
  const info = repositorySlug.split('/');

  const organization = info.shift() as 'string';
  const repository = info.join('/');
  return {
    organization,
    repository,
  };
};

export const useTagDetails = (org: string, repo: string, digest: string) => {
  const quayClient = useApi(quayApiRef);
  const result = useAsync(async () => {
    const manifestLayer = await quayClient.getSecurityDetails(
      org,
      repo,
      digest,
    );
    return manifestLayer;
  });
  return result;
};
