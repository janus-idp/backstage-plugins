import React, { useMemo } from 'react';
import { useAsync } from 'react-use';

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box, Chip, makeStyles } from '@material-ui/core';

import { formatByteSize, formatDate } from '@janus-idp/shared-react';

import { quayApiRef } from '../api';
import { Layer, Tag } from '../types';

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
  const quayClient = useApi(quayApiRef);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [tagManifestLayers, setTagManifestLayers] = React.useState<
    Record<string, Layer>
  >({});
  const [tagManifestStatuses, setTagManifestStatuses] = React.useState<
    Record<string, string>
  >({});
  const localClasses = useLocalStyles();

  const fetchSecurityDetails = async (tag: Tag) => {
    const securityDetails = await quayClient.getSecurityDetails(
      organization,
      repository,
      tag.manifest_digest,
    );
    return securityDetails;
  };

  const { loading } = useAsync(async () => {
    const tagsResponse = await quayClient.getTags(organization, repository);
    Promise.all(
      tagsResponse.tags.map(async tag => {
        const securityDetails = await fetchSecurityDetails(tag);
        const securityData = securityDetails.data;
        const securityStatus = securityDetails.status;

        setTagManifestStatuses(prevState => ({
          ...prevState,
          [tag.manifest_digest]: securityStatus,
        }));

        if (securityData) {
          setTagManifestLayers(prevState => ({
            ...prevState,
            [tag.manifest_digest]: securityData.Layer,
          }));
        }
      }),
    );
    setTags(prevTags => [...prevTags, ...tagsResponse.tags]);
    return tagsResponse;
  });

  const data = useMemo(() => {
    return Object.values(tags)?.map(tag => {
      const hashFunc = tag.manifest_digest.substring(0, 6);
      const shortHash = tag.manifest_digest.substring(7, 19);
      return {
        id: `${tag.manifest_digest}-${tag.name}`,
        name: tag.name,
        last_modified: formatDate(tag.last_modified),
        size: formatByteSize(tag.size),
        manifest_digest: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={hashFunc} className={localClasses.chip} />
            {shortHash}
          </Box>
        ),
        expiration: tag.expiration,
        securityDetails: tagManifestLayers[tag.manifest_digest],
        securityStatus: tagManifestStatuses[tag.manifest_digest],
        manifest_digest_raw: tag.manifest_digest,
        // is_manifest_list: tag.is_manifest_list,
        // reversion: tag.reversion,
        // start_ts: tag.start_ts,
        // end_ts: tag.end_ts,
        // manifest_list: tag.manifest_list,
      };
    });
  }, [tags, localClasses.chip, tagManifestLayers, tagManifestStatuses]);

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
